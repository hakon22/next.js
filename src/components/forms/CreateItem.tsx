/* eslint-disable no-nested-ternary */
import {
  Form, Button, Card, InputGroup, Spinner,
} from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { useFormik } from 'formik';
import ImgCrop from 'antd-img-crop';
import {
  useState, useEffect, useRef, useContext,
} from 'react';
import { PlusOutlined } from '@ant-design/icons';
import {
  Upload, Tooltip, UploadFile, Cascader,
} from 'antd';
import axios from 'axios';
import { SingleValueType } from 'rc-cascader/lib/Cascader';
import notify from '../../utilities/toast';
import { marketAdd, marketUpdate, selectors } from '../../slices/marketSlice';
import { useAppDispatch, useAppSelector } from '../../utilities/hooks';
import { createItemValidation, editItemValidation } from '../../validations/validations';
import roundingEldorado from '../../utilities/roundingEldorado';
import formClass from '../../utilities/formClass';
import { MobileContext } from '../Context';
import routes from '../../routes';
import { SetContext } from '../CardContextMenu';
import fetchImage from '../../utilities/fetchImage';

interface Option {
  value: string;
  label: string;
  children?: Option[];
}

const displayRender = (labels: string[]) => labels[labels.length - 1];

const CreateItem = ({ id, setContext }: { id?: number, setContext?: SetContext }) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const isMobile = useContext(MobileContext);

  const item = useAppSelector((state) => selectors.selectById(state, id || 0));

  const { token } = useAppSelector((state) => state.login);

  const uploadRef = useRef<HTMLDivElement>(null);
  const [isDiscount, setIsDiscount] = useState(false);
  const [fileList, setFileList] = useState<UploadFile[]>();

  const units: string[] = ['kg', 'gr', 'ea'];

  const fetchOptions = (object: object, subKey: string = ''): Option[] => Object.entries(object)
    .map(([key, value]) => {
      if (typeof value === 'object') {
        delete value.title;
        return {
          value: key,
          label: t(`createItem.category${subKey}.${key}.title`),
          children: fetchOptions(value, `${subKey}.${key}`),
        };
      }
      return {
        value: key,
        label: t(`createItem.category${!subKey ? '.' : `${subKey}.`}${key}`),
      };
    });

  const categories: Option[] = fetchOptions(t('createItem.category', { returnObjects: true }));

  const initialValues = item ? {
    image: item?.image,
    name: item?.name,
    unit: item?.unit,
    count: String(item?.count),
    price: String(item?.price),
    discountPrice: item?.discountPrice ? String(item?.discountPrice) : '',
    composition: item?.composition,
    foodValues: {
      carbohydrates: String(item?.foodValues.carbohydrates),
      fats: String(item?.foodValues.fats),
      proteins: String(item?.foodValues.proteins),
      ccal: String(item?.foodValues.ccal),
    },
    discount: item?.discount ? String(item?.discount) : '',
    category: item?.category,
  } : {
    image: '',
    name: '',
    unit: 'кг',
    count: '',
    price: '',
    discountPrice: '',
    composition: '',
    foodValues: {
      carbohydrates: '',
      fats: '',
      proteins: '',
      ccal: '',
    },
    discount: '',
    category: [],
  };

  const formik = useFormik({
    initialValues,
    validationSchema: fileList?.[0]?.uid === '-1' ? editItemValidation : createItemValidation,
    onSubmit: async (values, {
      resetForm, setFieldValue, setFieldError, setSubmitting,
    }) => {
      try {
        if (!values.discount) {
          values.discount = '0';
          values.discountPrice = '0';
        }
        const { foodValues, category, ...rest } = values;
        const { data } = await axios.post(item ? routes.editItem : routes.createItem, item ? {
          foodValues: JSON.stringify(foodValues),
          category: JSON.stringify(category),
          id,
          oldImage: item.image,
          ...rest,
        } : {
          foodValues: JSON.stringify(foodValues),
          category: JSON.stringify(category),
          ...rest,
        }, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        });
        if (data.code === 1) {
          if (id && setContext) {
            const {
              price, discountPrice, count, discount,
            } = data.item;
            dispatch(marketUpdate({
              id,
              changes: {
                ...data.item,
                id,
                price: Number(price),
                discountPrice: Number(discountPrice),
                count: Number(count),
                discount: Number(discount),
              },
            }));
            setContext(undefined);
            notify(t('toast.editItemSuccess'), 'success');
          } else {
            dispatch(marketAdd(data.item));
            setFieldValue('image', '');
            setFieldValue('category', []);
            setFileList([]);
            resetForm();
            notify(t('toast.createItemSuccess'), 'success');
          }
        } else if (data.code === 2) {
          setFieldError('name', t('validation.itemNameAlreadyExists'));
          setSubmitting(false);
        }
      } catch (e) {
        if (values.discount === '0') {
          values.discount = '';
          values.discountPrice = '';
        }
        notify(t('toast.unknownError'), 'error');
        console.log(e);
      }
    },
  });

  const onChange = (value: SingleValueType) => formik.setFieldValue('category', value || []);

  const updatePrice = () => {
    const { price, discount } = formik.values;
    const newPrice = Number(price) * (1 - Number(discount) / 100);
    formik.setFieldValue('discountPrice', roundingEldorado(newPrice).toString());
    setTimeout(() => setIsDiscount(false), 1);
  };

  const numbersFilter = (e: React.ChangeEvent<HTMLInputElement>) => formik.setFieldValue(e.target.name, e.target.value.replace(/[^\d]/g, ''));

  useEffect(() => {
    const uploadContainer = formik.values.image
      ? uploadRef.current?.querySelector('.ant-upload-list-item')
      : uploadRef.current?.querySelector('.ant-upload-select');

    if (formik.errors.image && formik.submitCount) {
      setTimeout(() => {
        uploadContainer?.classList.add('border', 'border-danger');
      }, 350);
    } else {
      uploadContainer?.classList.remove('border', 'border-danger');
    }
  }, [formik.errors.image, formik.submitCount]);

  useEffect(() => {
    if (item) {
      fetchImage(item.image).then((image) => {
        setFileList([{
          uid: '-1',
          name: item.image,
          status: 'done',
          url: image,
        }]);
      }).catch((e) => console.log(e));
    }
  }, []);

  return (
    <div className="marketplace d-flex justify-content-center">
      <Form onSubmit={formik.handleSubmit} className="col-12">
        <Card className="card-item">
          <div ref={uploadRef} className={formik.errors.image && formik.submitCount ? 'position-relative d-flex justify-content-center mb-3' : 'position-relative d-flex justify-content-center'}>
            <ImgCrop
              rotationSlider
              showReset
              modalCancel={t('imageCrop.modalCancel')}
              modalTitle={t('imageCrop.modalTitle')}
              resetText={t('imageCrop.resetText')}
              fillColor="transparent"
            >
              <Upload
                className="picture-circle d-flex justify-content-center my-3"
                listType="picture-card"
                accept="image/png"
                maxCount={1}
                fileList={fileList}
                onChange={({ fileList: newFileList }) => {
                  setFileList(newFileList);
                }}
                onRemove={(e) => {
                  console.log(e);
                  formik.setFieldValue('image', '');
                }}
                beforeUpload={(file) => {
                  formik.setFieldValue('image', file);
                  return false;
                }}
              >
                {!fileList?.length && (
                <div>
                  <PlusOutlined className="mb-2" />
                  <div>{t('createItem.upload')}</div>
                </div>
                )}
              </Upload>
            </ImgCrop>
            <Form.Control.Feedback type="invalid" className={formik.errors.image && formik.submitCount ? 'd-block top-84' : ''} tooltip>
              {t(formik.errors.image ?? '')}
            </Form.Control.Feedback>
          </div>
          <Card.Body className="pt-0 d-flex flex-column">
            <Form.Group className={formClass('name', 'mb-4 position-relative', formik)} controlId="name">
              <Form.Label className="visually-hidden">{t('createItem.nameItem')}</Form.Label>
              <Form.Control
                size="sm"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                isValid={!!(!formik.errors.name && formik.submitCount)}
                isInvalid={!!(formik.errors.name && formik.submitCount)}
                autoComplete="on"
                type="text"
                value={formik.values.name}
                name="name"
                placeholder={t('createItem.nameItem')}
              />
              <Form.Control.Feedback type="invalid" tooltip>
                {t(formik.errors.name ?? '')}
              </Form.Control.Feedback>
            </Form.Group>
            <Card.Text as="div">
              <div className={formClass('price', 'd-flex justify-content-between mb-3', formik)}>
                <Form.Group className="col-7 position-relative" controlId="price">
                  <Form.Label className="visually-hidden">{t('createItem.priceItem')}</Form.Label>
                  <InputGroup size="sm">
                    {formik.values.discountPrice
                    && (
                    <Tooltip title={t('createItem.tooltipPriceDiscount')} color="green" placement="top">
                      <InputGroup.Text id="inputGroup-priceOrig" className="text-success">{formik.values.discountPrice}</InputGroup.Text>
                    </Tooltip>
                    )}
                    <Tooltip title={formik.values.discountPrice ? t('createItem.tooltipPriceOriginal') : ''} color="volcano" placement="topLeft">
                      <Form.Control
                        placeholder={t('createItem.priceItem')}
                        className={formik.values.discountPrice && 'text-danger'}
                        onChange={({ target }) => {
                          if (formik.values.discount && !isDiscount) {
                            setIsDiscount(true);
                          }
                          formik.setFieldValue('price', target.value.replace(/[^\d]/g, ''));
                        }}
                        onBlur={formik.handleBlur}
                        isValid={!!(!formik.errors.price && formik.submitCount)}
                        isInvalid={!!(formik.errors.price && formik.submitCount)}
                        autoComplete="on"
                        type="text"
                        value={formik.values.price}
                        name="price"
                      />
                    </Tooltip>
                    <InputGroup.Text id="inputGroup-price">{t('createItem.rubSymbol')}</InputGroup.Text>
                    <Form.Control.Feedback type="invalid" tooltip>
                      {t(formik.errors.price ?? '')}
                    </Form.Control.Feedback>
                  </InputGroup>
                </Form.Group>
                <Form.Group className="col-4" controlId="unit">
                  <Form.Label className="visually-hidden">{t('createItem.unitItem.label')}</Form.Label>
                  <InputGroup size="sm">
                    <InputGroup.Text id="inputGroup-discount">{t('createItem.per')}</InputGroup.Text>
                    <Form.Select
                      size="sm"
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      value={formik.values.unit}
                      name="unit"
                    >
                      {units.map((unit) => <option key={unit} value={t(`createItem.unitItem.${unit}`)}>{t(`createItem.unitItem.${unit}`)}</option>)}
                    </Form.Select>
                  </InputGroup>
                </Form.Group>
              </div>
              <div className={formClass('count', 'd-flex justify-content-between mb-3', formik)}>
                <Form.Group className="col-7 position-relative" controlId="count">
                  <Form.Label className="visually-hidden">{t('createItem.countItem')}</Form.Label>
                  <Form.Control
                    size="sm"
                    onChange={numbersFilter}
                    onBlur={formik.handleBlur}
                    isValid={!!(!formik.errors.count && formik.submitCount)}
                    isInvalid={!!(formik.errors.count && formik.submitCount)}
                    autoComplete="on"
                    type="text"
                    value={formik.values.count}
                    name="count"
                    placeholder={t('createItem.countItem')}
                  />
                  <Form.Control.Feedback type="invalid" tooltip>
                    {t(formik.errors.count ?? '')}
                  </Form.Control.Feedback>
                </Form.Group>
                <Form.Group className="col-4" controlId="discount">
                  <Form.Label className="visually-hidden">{t('createItem.discount')}</Form.Label>
                  <InputGroup size="sm">
                    <Form.Control
                      placeholder={t('createItem.discount')}
                      onChange={({ target }) => {
                        const value = target.value.replace(/[^\d]/g, '');
                        if (!value || Number(value) === 0 || Number(value) > 99) {
                          setIsDiscount(false);
                          formik.setFieldValue('discountPrice', '');
                          return formik.setFieldValue('discount', '');
                        } if (!isDiscount && value) {
                          setIsDiscount(true);
                        }
                        return formik.setFieldValue('discount', value);
                      }}
                      onBlur={formik.handleBlur}
                      autoComplete="on"
                      type="text"
                      value={formik.values.discount}
                      name="discount"
                      disabled={!formik.values.price}
                    />
                    <InputGroup.Text id="inputGroup-discount">%</InputGroup.Text>
                  </InputGroup>
                </Form.Group>
              </div>
              <Form.Group className={formClass('category', 'd-flex justify-content-between position-relative mb-3', formik)} controlId="category">
                <Form.Label className="visually-hidden">{t('createItem.selectCategory')}</Form.Label>
                <Cascader
                  value={formik.values.category}
                  id="category"
                  options={categories}
                  className="col-7"
                  placeholder={t('createItem.selectCategory')}
                  expandTrigger={isMobile ? 'click' : 'hover'}
                  displayRender={displayRender}
                  status={(formik.errors.category && formik.submitCount) ? 'error' : ''}
                  onChange={onChange}
                />
                <Form.Control.Feedback type="invalid" className={formik.errors.category && formik.submitCount ? 'd-block' : ''} tooltip>
                  {t(formik.errors.category ?? '')}
                </Form.Control.Feedback>
              </Form.Group>
              <div className="mb-3">{t('createItem.foodValues')}</div>
              <div className={formik.errors.foodValues && formik.submitCount ? 'd-flex justify-content-between mb-6' : 'd-flex justify-content-between mb-3'}>
                <Form.Group className="col-3 position-relative" controlId="carbohydrates">
                  <Form.Label className="visually-hidden">{t('createItem.carbohydrates')}</Form.Label>
                  <Form.Control
                    size="sm"
                    onChange={numbersFilter}
                    onBlur={formik.handleBlur}
                    isValid={!!(!formik.errors.foodValues?.carbohydrates && formik.submitCount)}
                    isInvalid={!!(formik.errors.foodValues?.carbohydrates && formik.submitCount)}
                    autoComplete="on"
                    type="text"
                    value={formik.values.foodValues.carbohydrates}
                    name="foodValues.carbohydrates"
                    placeholder={t('createItem.carbohydrates')}
                  />
                  <Form.Control.Feedback type="invalid" tooltip>
                    {t(formik.errors.foodValues?.carbohydrates ?? '')}
                  </Form.Control.Feedback>
                </Form.Group>
                <Form.Group className="col-3 position-relative" controlId="fats">
                  <Form.Label className="visually-hidden">{t('createItem.fats')}</Form.Label>
                  <Form.Control
                    size="sm"
                    placeholder={t('createItem.fats')}
                    onChange={numbersFilter}
                    onBlur={formik.handleBlur}
                    isValid={!!(!formik.errors.foodValues?.fats && formik.submitCount)}
                    isInvalid={!!(formik.errors.foodValues?.fats && formik.submitCount)}
                    autoComplete="on"
                    type="text"
                    value={formik.values.foodValues.fats}
                    name="foodValues.fats"
                  />
                  <Form.Control.Feedback type="invalid" tooltip>
                    {t(formik.errors.foodValues?.fats ?? '')}
                  </Form.Control.Feedback>
                </Form.Group>
                <Form.Group className="col-3 position-relative" controlId="proteins">
                  <Form.Label className="visually-hidden">{t('createItem.proteins')}</Form.Label>
                  <Form.Control
                    size="sm"
                    placeholder={t('createItem.proteins')}
                    onChange={numbersFilter}
                    onBlur={formik.handleBlur}
                    isValid={!!(!formik.errors.foodValues?.proteins && formik.submitCount)}
                    isInvalid={!!(formik.errors.foodValues?.proteins && formik.submitCount)}
                    autoComplete="on"
                    type="text"
                    value={formik.values.foodValues.proteins}
                    name="foodValues.proteins"
                  />
                  <Form.Control.Feedback type="invalid" tooltip>
                    {t(formik.errors.foodValues?.proteins ?? '')}
                  </Form.Control.Feedback>
                </Form.Group>
                <Form.Group className="col-3 position-relative" controlId="ccal">
                  <Form.Label className="visually-hidden">{t('createItem.ccal')}</Form.Label>
                  <Form.Control
                    size="sm"
                    placeholder={t('createItem.ccal')}
                    onChange={numbersFilter}
                    onBlur={formik.handleBlur}
                    isValid={!!(!formik.errors.foodValues?.ccal && formik.submitCount)}
                    isInvalid={!!(formik.errors.foodValues?.ccal && formik.submitCount)}
                    autoComplete="on"
                    type="text"
                    value={formik.values.foodValues.ccal}
                    name="foodValues.ccal"
                  />
                  <Form.Control.Feedback type="invalid" tooltip>
                    {t(formik.errors.foodValues?.ccal ?? '')}
                  </Form.Control.Feedback>
                </Form.Group>
              </div>
              <Form.Group className={formClass('composition', 'mb-3 position-relative', formik)} controlId="composition">
                <Form.Label className="visually-hidden">{t('createItem.composition')}</Form.Label>
                <Form.Control
                  size="sm"
                  as="textarea"
                  placeholder={t('createItem.composition')}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  isValid={!!(!formik.errors.composition && formik.submitCount)}
                  isInvalid={!!(formik.errors.composition && formik.submitCount)}
                  autoComplete="on"
                  type="text"
                  value={formik.values.composition}
                  name="composition"
                />
                <Form.Control.Feedback type="invalid" tooltip>
                  {t(formik.errors.composition ?? '')}
                </Form.Control.Feedback>
              </Form.Group>
            </Card.Text>
            <div className="d-flex justify-content-center">
              {isDiscount ? (
                <Button variant="outline-success" onClick={updatePrice}>
                  {t('createItem.updatePrice')}
                </Button>
              ) : (
                <Button variant="success" type="submit" disabled={formik.isSubmitting}>
                  {formik.isSubmitting
                    ? (
                      <>
                        <Spinner
                          as="span"
                          animation="border"
                          size="sm"
                          role="status"
                          aria-hidden="true"
                        />
                        {item ? t('createItem.updating') : t('createItem.adding')}
                      </>
                    )
                    : item ? t('createItem.updateItem') : t('createItem.addItem')}
                </Button>
              )}
            </div>
          </Card.Body>
        </Card>
      </Form>
    </div>
  );
};

CreateItem.defaultProps = {
  id: undefined,
  setContext: undefined,
};

export default CreateItem;
