import { default as React } from 'react';
interface JsonModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    data: any;
    subtitle?: string;
}
declare const JsonModal: React.FC<JsonModalProps>;
export default JsonModal;
