import { createContext,useContext } from 'react';

export const ToastContext = createContext(() => {});
export const ConfirmContext = createContext(() => Promise.resolve(false));

// toast("text") or toast("text","bad")
export const useToast = () => useContext(ToastContext);

// const ok = await confirm({title,text,button})
export const useConfirm = () => useContext(ConfirmContext);
