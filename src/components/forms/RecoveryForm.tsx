import { useFormik } from 'formik';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { toLower } from 'lodash';
import {
  Button, Form, FloatingLabel, Spinner, Alert,
} from 'react-bootstrap';
import axios from 'axios';
import notify from '../../utilities/toast';
import formClass from '../../utilities/formClass';
import { emailValidation } from '../../validations/validations';
import routes from '../../routes';

const RecoveryForm = () => {
  const { t } = useTranslation();

  const [sendMail, setSendMail] = useState('');

  const formik = useFormik({
    initialValues: {
      email: '',
    },
    validationSchema: emailValidation,
    onSubmit: async (values, { setFieldError, setSubmitting }) => {
      try {
        values.email = toLower(values.email);
        const { data } = await axios.post(routes.recoveryPassword, values);
        if (data.code === 1) {
          setSendMail(values.email);
          notify(t('toast.emailSuccess'), 'success');
        } else if (data.code === 2) {
          setSubmitting(false);
          setFieldError('email', t('validation.userNotAlreadyExists'));
        }
      } catch (e) {
        notify(t('toast.unknownError'), 'error');
        console.log(e);
      }
    },
  });

  return (
    <div className="d-flex justify-content-center align-items-center">
      {sendMail ? (
        <Alert className="col-12 col-md-9 text-center mb-0">
          <span>{t('recoveryForm.toYourMail')}</span>
          <br />
          <span><b>{sendMail}</b></span>
          <br />
          <span>{t('recoveryForm.postNewPassword')}</span>
        </Alert>
      ) : (
        <Form
          onSubmit={formik.handleSubmit}
          className="col-12 col-md-9"
        >
          <FloatingLabel className={formClass('email', 'mb-3', formik)} label={t('signupForm.email')} controlId="email">
            <Form.Control
              autoFocus
              type="email"
              onChange={formik.handleChange}
              value={formik.values.email}
              disabled={formik.isSubmitting}
              isInvalid={!!(formik.errors.email && formik.submitCount)}
              onBlur={formik.handleBlur}
              name="email"
              autoComplete="on"
              placeholder={t('signupForm.email')}
            />
            <Form.Control.Feedback type="invalid" tooltip className="anim-show">
              {t(formik.errors.email ?? '')}
            </Form.Control.Feedback>
          </FloatingLabel>
          <Button variant="warning" className="w-100" type="submit" disabled={formik.isSubmitting}>
            {formik.isSubmitting ? (
              <Spinner
                as="span"
                animation="border"
                size="sm"
                role="status"
                aria-hidden="true"
              />
            ) : t('loginForm.recovery')}
          </Button>
        </Form>
      )}
    </div>
  );
};

export default RecoveryForm;
