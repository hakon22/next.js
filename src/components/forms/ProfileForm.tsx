import { Form, Button, Spinner } from 'react-bootstrap';
import {
  useState, useEffect, useContext, useRef,
} from 'react';
import InputMask from 'react-input-mask';
import { useTranslation } from 'react-i18next';
import { useFormik } from 'formik';
import { isEmpty, toLower, capitalize } from 'lodash';
import axios from 'axios';
import cn from 'classnames';
import { useAppDispatch } from '../../utilities/hooks';
import { changeUserData } from '../../slices/loginSlice';
import type { ProfileFormsProps } from '../../types/ProfileForms';
import { profileValidation } from '../../validations/validations';
import { ModalContext, MobileContext } from '../Context';
import formClass from '../../utilities/formClass';
import { ModalConfirmEmail } from '../Modals';
import notify from '../../utilities/toast';
import routes from '../../routes';

type FormikValues = { [key: string]: string | undefined };

type ChangeDataParams = (
  values: FormikValues,
  setSubmitting: (value: boolean) => void,
  setFieldValue: (field: string, value: string) => void,
  setFieldError: (field: string, value: string) => void,
) => Promise<void>;

const ProfileForm = ({ user, setLoading }: ProfileFormsProps) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const isMobile = useContext(MobileContext);
  const { show, modalClose, modalShow } = useContext(ModalContext);

  const passwordRef = useRef<HTMLInputElement>(null);

  const {
    username, email, phone, token,
  } = user;

  const [isChange, setIsChange] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [changedData, setChangedData] = useState<FormikValues>({});

  const changeData: ChangeDataParams = async (
    values,
    setSubmitting,
    setFieldValue,
    setFieldError,
  ) => {
    const { data } = await axios.post(routes.changeData, values, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (data.code === 1) {
      dispatch(changeUserData(data.newDataValues));
      setIsChange(false);
      if (values.password) {
        setFieldValue('password', '');
        setFieldValue('confirmPassword', '');
        setFieldValue('oldPassword', '');
      }
      notify(t('toast.changeDataSuccess'), 'success');
    } else if (data.code === 2) {
      setSubmitting(false);
      data.errorsFields.forEach((field: 'email' | 'phone') => {
        setFieldError(field, t('validation.userAlreadyExists'));
      });
    } else if (data.code === 3) {
      setSubmitting(false);
      setFieldError('oldPassword', t('validation.incorrectPassword'));
    }
    setIsConfirmed(false);
  };

  const initialValues: FormikValues = {
    username,
    email,
    phone,
    password: '',
    confirmPassword: '',
    oldPassword: '',
  };

  const formik = useFormik({
    initialValues,
    validationSchema: profileValidation,
    onSubmit: async (values, { setFieldError, setSubmitting, setFieldValue }) => {
      try {
        const initialObject: FormikValues = {};
        // получаем изменённые данные
        const changedValues = Object.keys(values).reduce((acc, key) => {
          if (initialValues[key] === values[key] || key === 'confirmPassword') {
            return acc;
          }
          return { ...acc, [key]: values[key] };
        }, initialObject);
        if (isEmpty(changedValues)) { // если ничего не изменилось, отменяем изменение
          setIsChange(false);
        } else {
          if (changedValues.username) {
            changedValues.username = capitalize(changedValues.username);
            setFieldValue('username', changedValues.username);
          }
          if (changedValues.email) { // если изменялась почта, отсылаем письмо для проверки
            changedValues.email = toLower(changedValues.email);
            setFieldValue('email', changedValues.email);
            const sendObject = {
              email: changedValues.email,
              phone: changedValues.phone,
              oldPassword: changedValues.oldPassword,
            };
            const { data } = await axios.post(routes.confirmEmail, sendObject, {
              headers: { Authorization: `Bearer ${token}` },
            });
            if (data.code === 3) { // старый пароль не совпадает
              setSubmitting(false);
              setFieldError('oldPassword', t('validation.incorrectPassword'));
            } else if (data.code === 4) { // такой пользователь уже существует
              setSubmitting(false);
              data.errorsFields.forEach((field: 'email' | 'phone') => {
                setFieldError(field, t('validation.userAlreadyExists'));
              });
            } else if (data.code === 5) { // письмо отправлено, ожидаем проверки
              setChangedData(changedValues);
              modalShow('confirmEmail');
            }
          } else { // если почта не изменялась, просто меняем данные
            await changeData(changedValues, setSubmitting, setFieldValue, setFieldError);
          }
        }
      } catch (e) {
        notify(t('toast.unknownError'), 'error');
        console.log(e);
      }
    },
  });

  const cancelChange = () => {
    if (!isConfirmed) {
      setIsChange(false);
      formik.resetForm({ values: initialValues });
    }
    if (show) {
      modalClose();
    }
  };

  useEffect(() => {
    if (isConfirmed) {
      modalClose();
      changeData(changedData, formik.setSubmitting, formik.setFieldValue, formik.setFieldError);
    }
  }, [isConfirmed]);

  useEffect(() => {
    if (formik.values.password?.length === 1) {
      passwordRef.current?.scrollIntoView();
    }
  }, [formik.values.password]);

  useEffect(() => {
    setLoading(formik.isSubmitting);
  }, [formik.isSubmitting]);

  useEffect(() => {
    setLoading(isConfirmed);
  }, [isConfirmed]);

  return (
    <>
      <ModalConfirmEmail show={show} onHide={cancelChange} setIsConfirmed={setIsConfirmed} />
      <Form onSubmit={formik.handleSubmit} className="col-12 col-md-5">
        <Form.Group className={formClass('username', 'mb-3 d-flex flex-column flex-md-row align-items-md-center gap-2', formik)}>
          <Form.Label className={cn('col-12 col-md-4', { 'mb-0': isMobile })}>
            {t('signupForm.username')}
          </Form.Label>
          <div className="position-relative w-100">
            <Form.Control
              type="text"
              placeholder={t('signupForm.username')}
              value={formik.values.username}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              disabled={formik.isSubmitting || !isChange}
              isInvalid={!!(formik.errors.username && formik.submitCount)}
              name="username"
              autoComplete="on"
            />
            <Form.Control.Feedback type="invalid" tooltip className="anim-show">
              {t(formik.errors.username ?? '')}
            </Form.Control.Feedback>
          </div>
        </Form.Group>
        <Form.Group className={formClass('email', 'mb-3 d-flex flex-column flex-md-row align-items-md-center gap-2', formik)} controlId="email">
          <Form.Label className={cn('col-12 col-md-4', { 'mb-0': isMobile })}>
            {t('signupForm.email')}
          </Form.Label>
          <div className="position-relative w-100">
            <Form.Control
              type="email"
              ref={passwordRef}
              placeholder={t('signupForm.email')}
              value={formik.values.email}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              disabled={formik.isSubmitting || !isChange}
              isInvalid={!!(formik.errors.email && formik.submitCount)}
              name="email"
              autoComplete="on"
            />
            <Form.Control.Feedback type="invalid" tooltip className="anim-show">
              {t(formik.errors.email ?? '')}
            </Form.Control.Feedback>
          </div>
        </Form.Group>
        <Form.Group className={formClass('phone', 'mb-3 d-flex flex-column flex-md-row align-items-md-center gap-2', formik)} controlId="phone">
          <Form.Label className={cn('col-12 col-md-4', { 'mb-0': isMobile })}>
            {t('signupForm.phone')}
          </Form.Label>
          <div className="position-relative w-100">
            <Form.Control
              as={InputMask}
              mask="+7 (999)-999-99-99"
              type="text"
              placeholder={t('signupForm.phone')}
              value={formik.values.phone}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              disabled={formik.isSubmitting || !isChange}
              isInvalid={!!(formik.errors.phone && formik.submitCount)}
              name="phone"
              autoComplete="on"
            />
            <Form.Control.Feedback type="invalid" tooltip className="anim-show">
              {t(formik.errors.phone ?? '')}
            </Form.Control.Feedback>
          </div>
        </Form.Group>
        <Form.Group className={formClass('password', 'mb-3 d-flex flex-column flex-md-row align-items-md-center gap-2', formik)} controlId="password">
          <Form.Label className={cn('col-12 col-md-4', { 'mb-0': isMobile })}>
            {t('signupForm.password')}
          </Form.Label>
          <div className="position-relative w-100">
            <Form.Control
              type="password"
              placeholder="••••••"
              value={formik.values.password}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              disabled={formik.isSubmitting || !isChange}
              isInvalid={!!(formik.errors.password && formik.submitCount)}
              name="password"
              autoComplete="on"
            />
            <Form.Control.Feedback type="invalid" tooltip className="anim-show">
              {t(formik.errors.password ?? '')}
            </Form.Control.Feedback>
          </div>
        </Form.Group>
        {formik.values.password && (
          <div className="animate__animated animate__fadeInDown">
            <Form.Group className={formClass('confirmPassword', 'mb-3 d-flex flex-column flex-md-row align-items-md-center gap-2', formik)} controlId="confirmPassword">
              <Form.Label className={cn('col-12 col-md-4', { 'mb-0': isMobile })}>
                {t('signupForm.confirmPassword')}
              </Form.Label>
              <div className="position-relative w-100">
                <Form.Control
                  type="password"
                  placeholder={t('signupForm.confirmPassword')}
                  value={formik.values.confirmPassword}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  disabled={formik.isSubmitting || !isChange}
                  isInvalid={!!(formik.errors.confirmPassword && formik.submitCount)}
                  name="confirmPassword"
                  autoComplete="on"
                />
                <Form.Control.Feedback type="invalid" tooltip className="anim-show">
                  {t(formik.errors.confirmPassword ?? '')}
                </Form.Control.Feedback>
              </div>
            </Form.Group>
            <Form.Group className={formClass('oldPassword', 'mb-3 d-flex flex-column flex-md-row align-items-md-center gap-2', formik)} controlId="oldPassword">
              <Form.Label className={cn('col-12 col-md-4', { 'mb-0': isMobile })}>
                {t('profile.profileForm.oldPassword')}
              </Form.Label>
              <div className="position-relative w-100">
                <Form.Control
                  type="password"
                  placeholder={t('profile.profileForm.enterOldPassword')}
                  value={formik.values.oldPassword}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  disabled={formik.isSubmitting || !isChange}
                  isInvalid={!!(formik.errors.oldPassword && formik.submitCount)}
                  name="oldPassword"
                  autoComplete="on"
                />
                <Form.Control.Feedback type="invalid" tooltip className="anim-show">
                  {t(formik.errors.oldPassword ?? '')}
                </Form.Control.Feedback>
              </div>
            </Form.Group>
          </div>
        )}
        <div className="d-flex justify-content-md-end gap-2 mb-5 mb-md-0">
          {!isChange && (
          <Button variant="warning" onClick={() => setIsChange(true)}>
            {t('profile.profileForm.changeData')}
          </Button>
          )}
          {isChange && (
            <>
              <Button variant="success" type="submit" disabled={formik.isSubmitting}>
                {formik.isSubmitting ? (
                  <Spinner
                    as="span"
                    animation="border"
                    size="sm"
                    role="status"
                    aria-hidden="true"
                  />
                ) : t('profile.profileForm.save')}
              </Button>
              <Button
                variant="danger"
                onClick={cancelChange}
                disabled={formik.isSubmitting}
              >
                {t('profile.profileForm.cancel')}
              </Button>
            </>
          )}
        </div>
      </Form>
    </>
  );
};

export default ProfileForm;
