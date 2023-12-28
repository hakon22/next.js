import { useRef, useContext } from 'react';
import {
  Form, Modal, Button, Spinner, Alert, FloatingLabel, Image,
} from 'react-bootstrap';
import {
  PlusCircle, DashCircle, XCircle, Check2Circle,
} from 'react-bootstrap-icons';
import { useRouter } from 'next/navigation';
import { useRouter as useNextRouter } from 'next/router';
import { useTranslation } from 'react-i18next';
import { useFormik } from 'formik';
import { Badge, Tooltip } from 'antd';
import InputMask from 'react-input-mask';
import axios from 'axios';
import { toLower } from 'lodash';
import { useAppDispatch, useAppSelector } from '../utilities/hooks';
import routes from '../routes';
import { changeEmailActivation } from '../slices/loginSlice';
import {
  cartUpdate, cartRemove, cartRemoveAll, selectors,
} from '../slices/cartSlice';
import { marketRemove, selectors as marketSelectors } from '../slices/marketSlice';
import notify from '../utilities/toast';
import { MobileContext, ScrollContext } from './Context';
import { emailValidation } from '../validations/validations';
import type {
  ModalActivateProps,
  ModalCartProps,
  ModalProps,
  ModalRemoveItemProps,
  ModalEditItemProps,
  ModalConfirmEmailProps,
} from '../types/Modal';
import CreateItem from './forms/CreateItem';
import RecoveryForm from './forms/RecoveryForm';
import LoginForm from './forms/LoginForm';
import SignupForm from './forms/SignupForm';

const ModalChangeActivationEmail = ({
  id, email, onHide, show,
}: ModalActivateProps) => {
  const { t } = useTranslation();
  const input = useRef<HTMLInputElement>(null);
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { setMarginScroll } = useContext(ScrollContext);

  const formik = useFormik({
    initialValues: {
      email,
    },
    validationSchema: emailValidation,
    onSubmit: async (values, { setFieldError, setSubmitting }) => {
      try {
        values.email = toLower(values.email);
        const { data } = await axios.post(routes.activationChangeEmail, { ...values, id });
        if (data.code === 1) {
          dispatch(changeEmailActivation(values.email));
          onHide();
          notify(t('toast.changeEmailSuccess'), 'success');
        } else if (data.code === 2) {
          setSubmitting(false);
          setFieldError('email', t('validation.emailAlreadyExists'));
        } else if (!data) {
          router.push(routes.loginPage);
          notify(t('toast.doesNotRequireActivation'), 'error');
        }
      } catch (e) {
        notify(t('toast.unknownError'), 'error');
        console.log(e);
      }
    },
  });

  return (
    <Modal
      show={show === 'activation'}
      onEnter={setMarginScroll}
      onExited={setMarginScroll}
      onHide={() => {
        onHide();
        formik.errors.email = '';
      }}
      centered
      onShow={() => {
        formik.values.email = email;
        setTimeout(() => input.current?.select(), 1);
      }}
    >
      <Modal.Header closeButton>
        <Modal.Title>{t('modal.changeEmail.changeEmailTitle')}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form
          onSubmit={formik.handleSubmit}
        >
          <Form.Group className="position-relative" controlId="email">
            <Form.Label className="visually-hidden">{t('modal.changeEmail.newEmail')}</Form.Label>
            <Form.Control
              autoFocus
              ref={input}
              className="mb-3-5 mt-1"
              onChange={formik.handleChange}
              value={formik.values.email}
              disabled={formik.isSubmitting}
              isInvalid={!!(formik.errors.email && formik.touched.email)}
              onBlur={formik.handleBlur}
              name="email"
            />
            <Form.Control.Feedback type="invalid" tooltip className="anim-show">
              {t(formik.errors.email ?? '')}
            </Form.Control.Feedback>
          </Form.Group>
          <div className="d-flex justify-content-end">
            <Button
              className="me-2"
              variant="secondary"
              onClick={() => {
                onHide();
                formik.errors.email = '';
              }}
            >
              {t('modal.changeEmail.close')}
            </Button>
            <Button variant="success" type="submit" disabled={formik.isSubmitting}>
              {formik.isSubmitting ? (
                <Spinner
                  as="span"
                  animation="border"
                  size="sm"
                  role="status"
                  aria-hidden="true"
                />
              ) : t('modal.changeEmail.submitChange')}
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export const ModalRecovery = ({ onHide, show }: ModalProps) => {
  const { t } = useTranslation();
  const { setMarginScroll } = useContext(ScrollContext);

  return (
    <Modal
      show={show === 'recovery'}
      contentClassName="modal-bg"
      onHide={onHide}
      onEnter={setMarginScroll}
      onExited={setMarginScroll}
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title className="text-center w-100">{t('recoveryForm.title')}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <RecoveryForm onHide={onHide} />
      </Modal.Body>
      <Modal.Footer>
        <span>{t('recoveryForm.rememberPassword')}</span>
        <Alert.Link
          className="text-primary"
          onClick={() => {
            onHide();
            setTimeout(() => onHide('login'), 300);
          }}
        >
          {t('loginForm.submit')}
        </Alert.Link>
      </Modal.Footer>
    </Modal>
  );
};

export const ModalLogin = ({ onHide, show }: ModalProps) => {
  const { t } = useTranslation();
  const { setMarginScroll } = useContext(ScrollContext);

  return (
    <Modal
      show={show === 'login'}
      contentClassName="modal-bg"
      onHide={onHide}
      onEnter={setMarginScroll}
      onExited={setMarginScroll}
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title className="text-center w-100">{t('loginForm.title')}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <LoginForm onHide={onHide} />
      </Modal.Body>
      <Modal.Footer>
        <span>{t('loginForm.notAccount')}</span>
        <Alert.Link
          className="text-primary"
          onClick={() => {
            onHide();
            setTimeout(() => onHide('signup'), 300);
          }}
        >
          {t('signupForm.title')}
        </Alert.Link>
      </Modal.Footer>
    </Modal>
  );
};

export const ModalSignup = ({ onHide, show }: ModalProps) => {
  const { t } = useTranslation();
  const { setMarginScroll } = useContext(ScrollContext);

  return (
    <Modal
      show={show === 'signup'}
      contentClassName="modal-bg"
      onHide={onHide}
      onEnter={setMarginScroll}
      onExited={setMarginScroll}
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title className="text-center w-100">{t('signupForm.title')}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <SignupForm onHide={onHide} />
      </Modal.Body>
      <Modal.Footer>
        <span>{t('signupForm.haveAccount')}</span>
        <Alert.Link
          className="text-primary"
          onClick={() => {
            onHide();
            setTimeout(() => onHide('login'), 300);
          }}
        >
          {t('loginForm.submit')}
        </Alert.Link>
      </Modal.Footer>
    </Modal>
  );
};

export const ModalCreateItem = ({
  onHide, show, context, setContext,
}: ModalEditItemProps) => {
  const { t } = useTranslation();
  const { setMarginScroll } = useContext(ScrollContext);

  return (
    <Modal
      show={show === 'createItem' || context?.action === 'editItem'}
      contentClassName="modal-bg"
      onHide={() => {
        onHide();
        if (setContext) {
          setContext(undefined);
        }
      }}
      onEnter={setMarginScroll}
      onExited={setMarginScroll}
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title className="text-center w-100">{setContext ? t('createItem.updateItem') : t('createItem.title')}</Modal.Title>
      </Modal.Header>
      <Modal.Body className="d-flex justify-content-center">
        <CreateItem id={context?.id} setContext={setContext} />
      </Modal.Body>
    </Modal>
  );
};

export const ModalCart = ({
  items, priceAndCount, onHide, show,
}: ModalCartProps) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();

  const isMobile = useContext(MobileContext);
  const { setMarginScroll } = useContext(ScrollContext);

  const setCount = (id: number, count: number) => (count < 1
    ? dispatch(cartRemove(id))
    : dispatch(cartUpdate({ id, changes: { count } })));

  return (
    <Modal
      show={show === 'cart' && !!priceAndCount.count}
      onHide={onHide}
      dialogClassName={isMobile ? '' : 'mw-50'}
      onEnter={setMarginScroll}
      onExited={setMarginScroll}
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title>{t('modal.cart.title')}</Modal.Title>
      </Modal.Header>
      <Form onSubmit={(e) => {
        e.preventDefault();
        onHide('order');
        dispatch(cartRemoveAll());
      }}
      >
        <Modal.Body className="d-flex flex-column gap-3">
          {items.map((item) => {
            if (item) {
              const {
                id, name, price, discountPrice, discount, count, image, unit,
              } = item;
              return (
                <div key={id} className="row d-flex justify-content-between align-items-center">
                  <div className="d-flex align-items-center mb-3 mb-xl-0 col-12 col-xl-5">
                    <Image className="col-3 col-xl-2 me-4" src={image} alt={name} />
                    <div className="col-9 col-xl-6 fw-bold d-flex align-items-center gap-1">
                      <span>{name}</span>
                      <Badge count={discount && t('cardItem.discount', { discount })} />
                    </div>
                  </div>
                  <span className="col-5 col-xl-3 fs-5 text-xl-center d-flex align-items-center gap-2">
                    <DashCircle
                      role="button"
                      title={t('modal.cart.decrease')}
                      className="icon-hover"
                      onClick={() => {
                        setCount(id, count - 1);
                      }}
                    />
                    {`${count} ${unit}`}
                    <PlusCircle
                      role="button"
                      title={t('modal.cart.increase')}
                      className="icon-hover"
                      onClick={() => {
                        setCount(id, count + 1);
                      }}
                    />
                  </span>
                  <span className="col-5 col-xl-3 fs-6">{t('modal.cart.price', { price: (discountPrice || price) * count })}</span>
                  <span className="col-2 col-xl-1 d-flex align-items-center">
                    <XCircle
                      role="button"
                      title={t('modal.cart.remove')}
                      className="fs-5 icon-hover"
                      onClick={() => {
                        dispatch(cartRemove(id));
                      }}
                    />
                  </span>
                </div>
              );
            }
            return undefined;
          })}
        </Modal.Body>
        <Modal.Footer className="d-flex justify-content-between py-4">
          <div className="d-flex gap-2">
            <Button variant="success" size="sm" type="submit">{t('modal.cart.sendOrder')}</Button>
            <Button
              variant="danger"
              size="sm"
              type="button"
              onClick={() => {
                dispatch(cartRemoveAll());
              }}
            >
              {t('modal.cart.clearCart')}
            </Button>
          </div>
          <Tooltip title={priceAndCount.discount ? t('modal.cart.discount', { discount: priceAndCount.discount }) : null} color="green" placement="top" trigger={['click', 'hover']}>
            <Badge count={priceAndCount.discount && <Badge status="processing" color="green" />} offset={[5, 0]}>
              <span className="text-end fw-bolder fs-6">
                {t('modal.cart.summ', { price: priceAndCount.price })}
              </span>
            </Badge>
          </Tooltip>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export const ModalOrder = ({ onHide, show }: ModalProps) => {
  const { t } = useTranslation();

  return (
    <Modal
      show={show === 'order'}
      onHide={onHide}
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title className="d-inline">
          <Check2Circle className="text-success fs-3 me-1" style={{ verticalAlign: '-0.23em' }} />
          <span>{t('modal.cart.orderAccept')}</span>
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="fs-4">{t('modal.cart.gratitude')}</div>
        <div className="d-flex justify-content-end">
          <Button
            className="me-2"
            variant="secondary"
            onClick={() => onHide()}
          >
            {t('modal.changeEmail.close')}
          </Button>
        </div>
      </Modal.Body>
    </Modal>
  );
};

export const ModalRemoveItem = ({
  onHide, show, context, setContext,
}: ModalRemoveItemProps) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const router = useNextRouter();

  const id = context?.id ?? 0;

  const item = useAppSelector((state) => marketSelectors.selectById(state, id));
  const itemInCart = useAppSelector((state) => selectors.selectById(state, id));

  const { setMarginScroll } = useContext(ScrollContext);
  const { token } = useAppSelector((state) => state.login);

  const formik = useFormik({
    initialValues: {},
    onSubmit: async () => {
      try {
        const { data } = await axios.delete(routes.removeItem, {
          params: { id },
          data: { image: item.image },
          headers: { Authorization: `Bearer ${token}` },
        });
        if (data.code === 1) {
          dispatch(marketRemove(id));
          if (itemInCart) {
            dispatch(cartRemove(id));
          }
          onHide();
          setContext(undefined);
          notify(t('toast.removeItemSuccess'), 'success');
          router.replace(router.asPath);
        } else if (data.code === 2) {
          onHide();
          setContext(undefined);
          notify(t('toast.removeItemError'), 'error');
        }
      } catch (e) {
        notify(t('toast.unknownError'), 'error');
        console.log(e);
      }
    },
  });

  return (
    <Modal
      show={show === 'removeItem'}
      contentClassName="modal-bg"
      onHide={() => {
        onHide();
        setContext(undefined);
      }}
      onEnter={setMarginScroll}
      onExited={setMarginScroll}
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title className="text-center w-100">{t('modal.removeItem.title')}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p className="lead">{t('modal.removeItem.body')}</p>
        <div className="d-flex justify-content-end">
          <Form
            onSubmit={formik.handleSubmit}
          >
            <Button
              className="me-2"
              variant="secondary"
              onClick={() => {
                onHide();
                setContext(undefined);
              }}
            >
              {t('modal.removeItem.close')}
            </Button>
            <Button
              variant="danger"
              type="submit"
              disabled={formik.isSubmitting}
            >
              {formik.isSubmitting ? (
                <Spinner
                  as="span"
                  animation="border"
                  size="sm"
                  role="status"
                  aria-hidden="true"
                />
              ) : t('modal.removeItem.remove')}
            </Button>
          </Form>
        </div>
      </Modal.Body>
    </Modal>
  );
};

export const ModalConfirmEmail = ({ onHide, show, setIsConfirmed }: ModalConfirmEmailProps) => {
  const { t } = useTranslation();

  const { setMarginScroll } = useContext(ScrollContext);
  const { token } = useAppSelector((state) => state.login);

  const formik = useFormik({
    initialValues: {
      code: '',
    },
    onSubmit: async (value, { setSubmitting, setFieldError, resetForm }) => {
      try {
        const { data } = await axios.post(routes.confirmEmail, value, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (data.code === 1) {
          setIsConfirmed(true);
          resetForm();
        } else if (data.code === 2) {
          setSubmitting(false);
          setFieldError('code', t('validation.incorrectCode'));
        }
      } catch (e) {
        notify(t('toast.unknownError'), 'error');
        console.log(e);
      }
    },
  });

  return (
    <Modal
      show={show === 'confirmEmail'}
      contentClassName="modal-bg"
      onHide={onHide}
      onEnter={setMarginScroll}
      onExited={setMarginScroll}
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title className="text-center w-100">{t('modal.confirmEmail.title')}</Modal.Title>
      </Modal.Header>
      <Form
        onSubmit={formik.handleSubmit}
      >
        <Modal.Body>
          <p className="lead text-center mb-4">{t('modal.confirmEmail.body')}</p>
          <FloatingLabel className="mb-3 col-md-6 mx-auto" label={t('activationForm.code')} controlId="code">
            <Form.Control
              autoFocus
              as={InputMask}
              mask="9999"
              type="text"
              onChange={formik.handleChange}
              value={formik.values.code}
              disabled={formik.isSubmitting}
              isInvalid={!!(formik.errors.code && formik.submitCount)}
              onBlur={formik.handleBlur}
              name="code"
              autoComplete="off"
              placeholder={t('activationForm.code')}
            />
            <Form.Control.Feedback type="invalid" tooltip className="anim-show">
              {t(formik.errors.code ?? '')}
            </Form.Control.Feedback>
          </FloatingLabel>
        </Modal.Body>
        <Modal.Footer className="d-flex justify-content-end">
          <Button
            variant="success"
            type="submit"
            disabled={formik.isSubmitting}
          >
            {formik.isSubmitting ? (
              <Spinner
                as="span"
                animation="border"
                size="sm"
                role="status"
                aria-hidden="true"
              />
            ) : t('modal.confirmEmail.submit')}
          </Button>
          <Button
            className="me-2"
            variant="secondary"
            onClick={() => onHide()}
          >
            {t('modal.confirmEmail.cancel')}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

ModalCreateItem.defaultProps = {
  id: undefined,
};

export default ModalChangeActivationEmail;
