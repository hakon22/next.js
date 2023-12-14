/* eslint-disable no-nested-ternary */
import { Form, Button, Spinner } from 'react-bootstrap';
import {
  useState, useEffect, useContext, useRef,
} from 'react';
import { useTranslation } from 'react-i18next';
import { useFormik } from 'formik';
import axios from 'axios';
import { isEqual } from 'lodash';
import { useAppDispatch } from '../../utilities/hooks';
import { addAddress, updateAddress } from '../../slices/loginSlice';
import type { ProfileFormsProps } from '../../types/ProfileForms';
import { addressValidation } from '../../validations/validations';
import { MobileContext } from '../Context';
import formClass from '../../utilities/formClass';
import notify from '../../utilities/toast';
import routes from '../../routes';
import AddressList from '../AddressList';

const upperCase = (str: string) => str.replace(/\s+/g, ' ')
  .trim()
  .split(' ')
  .map((name) => name.replace(name[0], name[0].toUpperCase()))
  .join(' ');

const AddressForm = ({ user, setLoading }: ProfileFormsProps) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const isMobile = useContext(MobileContext);

  const addressRef = useRef<HTMLButtonElement>(null);

  const { token, addresses } = user;

  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [editingIndexAddress, setEditingIndexAddress] = useState(-1);

  const editingAddress = addresses?.addressList?.[editingIndexAddress];

  const initialValues = editingAddress || {
    city: '',
    street: '',
    house: '',
    building: '',
    floor: '',
    intercom: '',
    frontDoor: '',
    apartment: '',
    comment: '',
  };

  const formik = useFormik({
    initialValues,
    validationSchema: addressValidation,
    onSubmit: async (values, { resetForm }) => {
      try {
        values.city = upperCase(values.city);
        values.street = upperCase(values.street);
        const { data } = editingAddress
          ? await axios.patch(
            routes.updateAddress,
            { oldObject: initialValues, newObject: values },
            {
              headers: { Authorization: `Bearer ${token}` },
            },
          )
          : await axios.post(routes.addAddress, values, {
            headers: { Authorization: `Bearer ${token}` },
          });
        if (data.code === 1) {
          setIsAddingAddress(false);
          if (editingAddress) {
            setEditingIndexAddress(-1);
            dispatch(updateAddress({ oldObject: initialValues, newObject: values }));
            notify(t('toast.updateAddressSuccess'), 'success');
          } else {
            dispatch(addAddress(values));
            notify(t('toast.addAddressSuccess'), 'success');
          }
          resetForm({ values: initialValues });
        }
      } catch (e) {
        notify(t('toast.unknownError'), 'error');
        console.log(e);
      }
    },
  });

  useEffect(() => {
    if (isAddingAddress) {
      addressRef.current?.scrollIntoView();
    }
  }, [isAddingAddress]);

  useEffect(() => {
    if (editingIndexAddress >= 0) {
      formik.resetForm({ values: initialValues });
      setIsAddingAddress(true);
    }
    formik.resetForm({ values: initialValues });
  }, [editingIndexAddress]);

  useEffect(() => {
    setLoading(formik.isSubmitting);
  }, [formik.isSubmitting]);

  return (
    <div className="col-12 col-md-5 d-flex flex-column justify-content-center align-items-center">
      <h5 className="mb-3">{t('profile.addressForm.myAddresses')}</h5>
      <div className="mb-2 w-100">
        <AddressList addresses={addresses} actions={{ setEditingIndexAddress, setLoading }} />
      </div>
      {isAddingAddress ? (
        <Form onSubmit={formik.handleSubmit} className="mb-3 d-flex flex-column animate__animated animate__fadeInDown">
          <div className="d-flex justify-content-between gap-4">
            <Form.Group className={formClass('city', 'mb-3 position-relative', formik)} style={{ width: isMobile ? '45%' : '46.5%' }} controlId="city">
              <Form.Label>
                <span className="text-danger">{t('profile.addressForm.requiredField')}</span>
                {t('profile.addressForm.addressList.city')}
              </Form.Label>
              <Form.Control
                type="text"
                size="sm"
                placeholder={t('profile.addressForm.addressList.city')}
                value={formik.values.city}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                disabled={formik.isSubmitting}
                isInvalid={!!(formik.errors.city && formik.submitCount)}
                name="city"
                autoComplete="on"
              />
              <Form.Control.Feedback type="invalid" tooltip className="anim-show">
                {t(formik.errors.city ?? '')}
              </Form.Control.Feedback>
            </Form.Group>
            <Form.Group className={formClass('street', 'mb-3 position-relative w-100', formik)} controlId="street">
              <Form.Label>
                <span className="text-danger">{t('profile.addressForm.requiredField')}</span>
                {t('profile.addressForm.addressList.street')}
              </Form.Label>
              <Form.Control
                type="text"
                size="sm"
                placeholder={t('profile.addressForm.addressList.street')}
                value={formik.values.street}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                disabled={formik.isSubmitting}
                isInvalid={!!(formik.errors.street && formik.submitCount)}
                name="street"
                autoComplete="on"
              />
              <Form.Control.Feedback type="invalid" tooltip className="anim-show">
                {t(formik.errors.street ?? '')}
              </Form.Control.Feedback>
            </Form.Group>
          </div>
          <div className="d-flex justify-content-between gap-4">
            <Form.Group className={formClass('house', 'mb-3 position-relative', formik)} controlId="house">
              <Form.Label>
                <span className="text-danger">{t('profile.addressForm.requiredField')}</span>
                {t('profile.addressForm.addressList.house')}
              </Form.Label>
              <Form.Control
                type="text"
                size="sm"
                placeholder={t('profile.addressForm.addressList.house')}
                value={formik.values.house}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                disabled={formik.isSubmitting}
                isInvalid={!!(formik.errors.house && formik.submitCount)}
                name="house"
                autoComplete="on"
              />
              <Form.Control.Feedback type="invalid" tooltip className="anim-show">
                {t(formik.errors.house ?? '')}
              </Form.Control.Feedback>
            </Form.Group>
            <Form.Group className={formClass('building', 'mb-3', formik)} controlId="building">
              <Form.Label>{t('profile.addressForm.addressList.building')}</Form.Label>
              <Form.Control
                type="text"
                size="sm"
                placeholder={t('profile.addressForm.addressList.building')}
                value={formik.values.building}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                disabled={formik.isSubmitting}
                isInvalid={!!(formik.errors.building && formik.submitCount)}
                name="building"
                autoComplete="on"
              />
              <Form.Control.Feedback type="invalid" tooltip className="anim-show">
                {t(formik.errors.building ?? '')}
              </Form.Control.Feedback>
            </Form.Group>
            <Form.Group className={formClass('frontDoor', 'mb-3', formik)} controlId="frontDoor">
              <Form.Label>{t('profile.addressForm.addressList.frontDoor')}</Form.Label>
              <Form.Control
                type="text"
                size="sm"
                placeholder={t('profile.addressForm.addressList.frontDoor')}
                value={formik.values.frontDoor}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                disabled={formik.isSubmitting}
                isInvalid={!!(formik.errors.frontDoor && formik.submitCount)}
                name="frontDoor"
                autoComplete="on"
              />
              <Form.Control.Feedback type="invalid" tooltip className="anim-show">
                {t(formik.errors.frontDoor ?? '')}
              </Form.Control.Feedback>
            </Form.Group>
          </div>
          <div className="d-flex justify-content-between gap-4">
            <Form.Group className={formClass('intercom', 'mb-3', formik)} controlId="intercom">
              <Form.Label>{t('profile.addressForm.addressList.intercom')}</Form.Label>
              <Form.Control
                type="text"
                size="sm"
                placeholder={t('profile.addressForm.addressList.intercom')}
                value={formik.values.intercom}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                disabled={formik.isSubmitting}
                isInvalid={!!(formik.errors.intercom && formik.submitCount)}
                name="intercom"
                autoComplete="on"
              />
              <Form.Control.Feedback type="invalid" tooltip className="anim-show">
                {t(formik.errors.intercom ?? '')}
              </Form.Control.Feedback>
            </Form.Group>
            <Form.Group className={formClass('floor', 'mb-3', formik)} controlId="floor">
              <Form.Label>{t('profile.addressForm.addressList.floor')}</Form.Label>
              <Form.Control
                type="text"
                size="sm"
                placeholder={t('profile.addressForm.addressList.floor')}
                value={formik.values.floor}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                disabled={formik.isSubmitting}
                isInvalid={!!(formik.errors.floor && formik.submitCount)}
                name="floor"
                autoComplete="on"
              />
              <Form.Control.Feedback type="invalid" tooltip className="anim-show">
                {t(formik.errors.floor ?? '')}
              </Form.Control.Feedback>
            </Form.Group>
            <Form.Group className={formClass('apartment', 'mb-3', formik)} controlId="apartment">
              <Form.Label>{t('profile.addressForm.addressList.apartment')}</Form.Label>
              <Form.Control
                type="text"
                size="sm"
                placeholder={t('profile.addressForm.addressList.apartment')}
                value={formik.values.apartment}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                disabled={formik.isSubmitting}
                isInvalid={!!(formik.errors.apartment && formik.submitCount)}
                name="apartment"
                autoComplete="on"
              />
              <Form.Control.Feedback type="invalid" tooltip className="anim-show">
                {t(formik.errors.apartment ?? '')}
              </Form.Control.Feedback>
            </Form.Group>
          </div>
          <Form.Group className={formClass('comment', 'mb-3', formik)} controlId="comment">
            <Form.Label>{t('profile.addressForm.addressList.comment')}</Form.Label>
            <Form.Control
              type="text"
              as="textarea"
              size="sm"
              placeholder={t('profile.addressForm.addressList.comment')}
              value={formik.values.comment}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              disabled={formik.isSubmitting}
              isInvalid={!!(formik.errors.comment && formik.submitCount)}
              name="comment"
              autoComplete="on"
            />
            <Form.Control.Feedback type="invalid" tooltip className="anim-show">
              {t(formik.errors.comment ?? '')}
            </Form.Control.Feedback>
          </Form.Group>
          <div className="d-flex gap-2">
            <Button
              ref={addressRef}
              variant="success"
              type="submit"
              disabled={formik.isSubmitting || isEqual(initialValues, formik.values)}
            >
              {formik.isSubmitting ? (
                <Spinner
                  as="span"
                  animation="border"
                  size="sm"
                  role="status"
                  aria-hidden="true"
                />
              ) : editingAddress ? t('profile.addressForm.updating') : t('profile.addressForm.adding')}
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                if (editingAddress) {
                  setEditingIndexAddress(-1);
                }
                setIsAddingAddress(false);
              }}
              disabled={formik.isSubmitting}
            >
              {t('profile.profileForm.cancel')}
            </Button>
          </div>
        </Form>
      ) : <Button variant="warning" onClick={() => setIsAddingAddress(true)}>Добавить адрес</Button>}
    </div>
  );
};

export default AddressForm;
