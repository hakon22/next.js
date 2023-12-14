import { useFormik } from 'formik';
import { useTranslation } from 'react-i18next';
import { useContext } from 'react';
import InputMask from 'react-input-mask';
import {
  Button, Form, FloatingLabel, Alert, Spinner,
} from 'react-bootstrap';
import { fetchLogin } from '../../slices/loginSlice';
import AuthContext from '../Context';
import { loginValidation } from '../../validations/validations';
import { useAppDispatch } from '../../utilities/hooks';
import formClass from '../../utilities/formClass';
import type { ModalProps } from '../../types/Modal';

const LoginForm = ({ onHide }: ModalProps) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { logIn } = useContext(AuthContext);

  const formik = useFormik({
    initialValues: {
      phone: '',
      password: '',
      save: false,
    },
    validationSchema: loginValidation,
    onSubmit: async (values, { setFieldError, setSubmitting }) => {
      try {
        const {
          payload: { code, user },
        } = await dispatch(fetchLogin(values));
        if (code === 1) {
          if (values.save) {
            window.localStorage.setItem('refresh_token', user.refreshToken);
          }
          logIn();
          onHide();
        } else if (code === 4) {
          setSubmitting(false);
          setFieldError('phone', t('validation.userNotAlreadyExists'));
        } else if (code === 3) {
          setSubmitting(false);
          setFieldError('password', t('validation.incorrectPassword'));
        } else if (code === 2) {
          setSubmitting(false);
          setFieldError('phone', t('validation.accountNotActivated'));
        } else if (!code) {
          setSubmitting(false);
        }
      } catch (e) {
        console.log(e);
      }
    },
  });

  return (
    <div className="d-flex justify-content-center">
      <Form
        onSubmit={formik.handleSubmit}
        className="col-12 col-md-9"
      >
        <FloatingLabel className={formClass('phone', 'mb-3', formik)} label={t('loginForm.phone')} controlId="phone">
          <Form.Control
            as={InputMask}
            mask="+7 (999)-999-99-99"
            type="text"
            onChange={formik.handleChange}
            value={formik.values.phone}
            disabled={formik.isSubmitting}
            isInvalid={!!(formik.errors.phone && formik.submitCount)}
            isValid={!!(!formik.errors.phone && formik.touched.phone)}
            onBlur={formik.handleBlur}
            name="phone"
            autoComplete="on"
            placeholder={t('loginForm.phone')}
          />
          <Form.Control.Feedback type="invalid" tooltip className="anim-show">
            {t(formik.errors.phone ?? '')}
          </Form.Control.Feedback>
        </FloatingLabel>

        <FloatingLabel className={formClass('password', 'mb-3', formik)} label={t('loginForm.password')} controlId="password">
          <Form.Control
            onChange={formik.handleChange}
            value={formik.values.password}
            disabled={formik.isSubmitting}
            isInvalid={!!(formik.errors.password && formik.submitCount)}
            isValid={!!(!formik.errors.password && formik.touched.password)}
            onBlur={formik.handleBlur}
            name="password"
            type="password"
            placeholder={t('loginForm.password')}
          />
          <Form.Control.Feedback type="invalid" tooltip className="anim-show">
            {t(formik.errors.password ?? '')}
          </Form.Control.Feedback>
        </FloatingLabel>
        <Form.Group className="d-flex justify-content-between align-items-center mb-2">
          <Form.Check
            onChange={formik.handleChange}
            disabled={formik.isSubmitting}
            onBlur={formik.handleBlur}
            type="checkbox"
            id="save"
            name="save"
            label={t('loginForm.checkbox')}
          />
          <Alert.Link
            className="text-primary fw-light fs-7"
            onClick={() => {
              onHide();
              setTimeout(() => onHide('recovery'), 300);
            }}
          >
            {t('loginForm.forgotPassword')}
          </Alert.Link>
        </Form.Group>
        <Button variant="warning" className="w-100" type="submit" disabled={formik.isSubmitting}>
          {formik.isSubmitting ? (
            <Spinner
              as="span"
              animation="border"
              size="sm"
              role="status"
              aria-hidden="true"
            />
          ) : t('loginForm.submit')}
        </Button>
      </Form>
    </div>
  );
};

export default LoginForm;
