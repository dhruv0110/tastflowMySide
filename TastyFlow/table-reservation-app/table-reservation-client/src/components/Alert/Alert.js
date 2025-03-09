import React, { useEffect } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Alert = (props) => {
    const capitalize = (word) => {
        if (word === 'danger') {
            word = "error";
        }
        var lower = word.toLowerCase();
        return lower.charAt(0).toUpperCase() + lower.slice(1);
    }

    useEffect(() => {
        if (props.alert) {
            const message = `${capitalize(props.alert.type)}: ${props.alert.message}`;
            switch (props.alert.type) {
                case 'success':
                    toast.success(message);
                    break;
                case 'error':
                case 'danger': // in case you keep 'danger' as type
                    toast.error(message);
                    break;
                case 'warning':
                    toast.warning(message);
                    break;
                case 'info':
                    toast.info(message);
                    break;
                default:
                    toast(message);
            }
        }
    }, [props.alert]);

    return (
        <div>
           <ToastContainer style={{marginTop:"50px"}}/>
        </div>
    );
}

export default Alert;
