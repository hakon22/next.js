import cn from 'classnames';
import { FormikProps } from 'formik';

const formClass = <T>(
  field: string,
  style: string,
  formik: FormikProps<{ [key: string]: string | boolean | object | undefined } & T>) => cn(style, {
    'mb-3-5': formik.errors[field] && formik.touched[field] && formik.submitCount,
  });

export default formClass;
