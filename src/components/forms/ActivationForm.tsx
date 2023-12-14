import { useFormik } from 'formik';
import { useState, useEffect, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/navigation';
import InputMask from 'react-input-mask';
import axios from 'axios';
import cn from 'classnames';
import {
  Button, Form, FloatingLabel, Image, DropdownButton, ButtonGroup, Dropdown, Spinner,
} from 'react-bootstrap';
import { EnvelopeAt } from 'react-bootstrap-icons';
import notify from '../../utilities/toast';
import { updateTokens } from '../../slices/loginSlice';
import { MobileContext, ModalContext } from '../Context';
import ModalChangeActivationEmail from '../Modals';
import { useAppDispatch, useAppSelector } from '../../utilities/hooks';
import { activationValidation } from '../../validations/validations';
import formClass from '../../utilities/formClass';
import pineapple from '../../images/pineapple.svg';
import routes from '../../routes';

const ActivationForm = ({ id }: { id: string | undefined }) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const router = useRouter();
  const isMobile = useContext(MobileContext);
  const { show, modalShow } = useContext(ModalContext);

  const { email } = useAppSelector((state) => state.login);
  const [timer, setTimer] = useState<number>(59);

  const repeatEmail = async () => {
    try {
      const { data } = await axios.get(`${routes.activationRepeatEmail}${id}`);
      if (data) {
        setTimer(59);
        notify(t('toast.emailSuccess'), 'success');
      } else {
        router.push(routes.loginPage);
        notify(t('toast.doesNotRequireActivation'), 'error');
      }
    } catch (e) {
      notify(t('toast.unknownError'), 'error');
      console.log(e);
    }
  };

  const formik = useFormik({
    initialValues: {
      code: '',
    },
    validationSchema: activationValidation,
    onSubmit: async (values, { setFieldError, setSubmitting }) => {
      try {
        const { data } = await axios.post(routes.activation, { ...values, id });
        if (data.code === 1) {
          await dispatch(updateTokens(data.refreshToken));
          router.push(routes.homePage);
          notify(t('toast.activationSuccess'), 'success');
        } else if (data.code === 2) {
          setSubmitting(false);
          setFieldError('code', t('validation.incorrectCode'));
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

  useEffect(() => {
    if (timer) {
      const timerAlive = setTimeout(setTimer, 1000, timer - 1);
      return () => clearTimeout(timerAlive);
    }
    return undefined;
  }, [timer]);

  return (
    <div className={cn('d-flex justify-content-center align-items-center gap-3', {
      'flex-column': isMobile,
      'gap-1': !isMobile,
    })}
    >
      <Image
        className={cn('mx-auto w-25 h-25', {
          'w-50 h-50 mb-2 mt-3': isMobile,
          'me-2 mb-4': !isMobile,
        })}
        src={pineapple}
        alt={t('loginForm.title')}
        roundedCircle
      />
      <ModalChangeActivationEmail id={id} email={email} show={show} onHide={modalShow} />
      <Form
        onSubmit={formik.handleSubmit}
        className={cn('col-12 col-md-7 mb-4', {
          'mt-4': !isMobile,
        })}
      >
        <div>{t('activationForm.toYourMail')}</div>
        <DropdownButton
          as={ButtonGroup}
          size="sm"
          variant="warning"
          className="mt-1 mb-1"
          title={email ?? ''}
        >
          <Dropdown.Item eventKey="1" onClick={() => modalShow('activation')}>{t('activationForm.dropMenuChange')}</Dropdown.Item>
        </DropdownButton>
        <div className="d-block mb-3">{t('activationForm.postConfirmCode')}</div>
        <FloatingLabel className={formClass('code', 'mb-3-5 col-lg-7 mx-auto', formik)} label={t('activationForm.code')} controlId="code">
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
        { timer
          ? (<p className="text-muted mb-3-5">{`${timer < 10 ? t('activationForm.timerTextZero') : t('activationForm.timerText')}${timer}`}</p>)
          : (
            <Button onClick={repeatEmail} variant="warning" className="d-block mx-auto mb-3-5 anim-show" size="sm" disabled={formik.isSubmitting}>
              <EnvelopeAt />
              {t('activationForm.timerButton')}
            </Button>
          )}
        <Button variant="outline-primary" type="submit" disabled={formik.isSubmitting}>
          {formik.isSubmitting ? (
            <Spinner
              as="span"
              animation="border"
              size="sm"
              role="status"
              aria-hidden="true"
            />
          ) : t('activationForm.submit')}
        </Button>
      </Form>
    </div>
  );
};

export default ActivationForm;
