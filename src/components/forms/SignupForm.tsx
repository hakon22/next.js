import { useFormik } from 'formik';
import { useTranslation } from 'react-i18next';
import {
  Button, Form, FloatingLabel, Spinner,
} from 'react-bootstrap';
import InputMask from 'react-input-mask';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { toLower, capitalize } from 'lodash';
import type { ModalProps } from '@/types/Modal';
import notify from '../../utilities/toast';
import { signupValidation } from '../../validations/validations';
import formClass from '../../utilities/formClass';
import routes from '../../routes';
import textFieldGen from '../../utilities/textFieldGen';

const SignupForm = ({ onHide }: ModalProps) => {
  const { t } = useTranslation();
  const router = useRouter();

  const formik = useFormik<{ [key: string]: string }>({
    initialValues: {
      username: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
    },
    validationSchema: signupValidation,
    onSubmit: async (values, { setFieldError, setSubmitting }) => {
      try {
        values.username = capitalize(values.username);
        values.email = toLower(values.email);
        const { data: { code, id, errorsFields } } = await axios.post(routes.signup, values);
        if (code === 1) {
          router.push(`${routes.activationUrlPage}${id}`);
          onHide();
        } else if (code === 2) {
          setSubmitting(false);
          errorsFields.forEach((field: 'email' | 'phone') => {
            setFieldError(field, t('validation.userAlreadyExists'));
          });
        } else if (!code) {
          setSubmitting(false);
          notify(t('toast.networkError'), 'error');
        }
      } catch (e) {
        notify(t('toast.unknownError'), 'error');
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
        {Object.keys(formik.values).map((key) => {
          const { type } = textFieldGen(key);
          return (
            <FloatingLabel key={key} className={formClass(key, 'mb-3', formik)} label={t(`signupForm.${[key]}`)} controlId={key}>
              <Form.Control
                as={key === 'phone' ? InputMask : undefined}
                mask={key === 'phone' ? '+7 (999)-999-99-99' : ''}
                type={type}
                onChange={formik.handleChange}
                value={formik.values[key]}
                disabled={formik.isSubmitting}
                isInvalid={!!(formik.errors[key] && formik.submitCount)}
                isValid={!!(!formik.errors[key] && formik.touched[key])}
                onBlur={formik.handleBlur}
                name={key}
                autoComplete="on"
                placeholder={t(`signupForm.${[key]}`)}
              />
              <Form.Control.Feedback type="invalid" tooltip className="anim-show">
                {t(formik.errors[key] ?? '')}
              </Form.Control.Feedback>
            </FloatingLabel>
          );
        })}
        <Button variant="warning" className="w-100" type="submit" disabled={formik.isSubmitting}>
          {formik.isSubmitting ? (
            <Spinner
              as="span"
              animation="border"
              size="sm"
              role="status"
              aria-hidden="true"
            />
          ) : t('signupForm.submit')}
        </Button>
      </Form>
    </div>
  );
};

export default SignupForm;
