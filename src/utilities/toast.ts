import { toast } from 'react-toastify';

type ToastType = 'info' | 'success' |'warning' | 'error';

const notify = (text: string, type: ToastType) => toast[type](text);

export default notify;
