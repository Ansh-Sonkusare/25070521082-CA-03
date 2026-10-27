import { useCallback,useEffect,useRef,useState } from 'react';
import { ToastContext,ConfirmContext } from './uiContext';

// Gives the whole app toasts and the animated confirm modal
const UiProvider = ({children}) =>{

    const [toasts,setToasts] = useState([]);
    const [dialog,setDialog] = useState(null);
    const [closing,setClosing] = useState(false);
    const nextId = useRef(1);
    const confirmBtn = useRef(null);

    const toast = useCallback((text,type = "ok") =>{

        const id = nextId.current++;

        setToasts(list => [...list,{id,text,type,leaving : false}]);

        // start the exit animation, then remove
        setTimeout(() => setToasts(list => list.map(t => t.id === id ? {...t,leaving : true} : t)),3200);
        setTimeout(() => setToasts(list => list.filter(t => t.id !== id)),3600);

    },[]);

    const confirm = useCallback((options) =>{

        return new Promise(resolve => setDialog({...options,resolve}));

    },[]);

    const answer = useCallback((value) =>{

        setClosing(true);

        setTimeout(()=>{
            dialog.resolve(value);
            setDialog(null);
            setClosing(false);
        },180);

    },[dialog]);

    // Escape cancels, focus goes to the confirm button
    useEffect(()=>{

        if( !dialog ) return;

        confirmBtn.current && confirmBtn.current.focus();

        const onKey = (e) =>{ if( e.key === "Escape" ) answer(false); };
        window.addEventListener("keydown",onKey);

        return () => window.removeEventListener("keydown",onKey);

    },[dialog,answer]);

    return (
        <ToastContext.Provider value={toast}>
            <ConfirmContext.Provider value={confirm}>

                {children}

                <div className="toasts" aria-live="polite">
                    {
                        toasts.map(t =>
                            <div key={t.id} className={"toast-box " + t.type + (t.leaving ? " leave" : "")} role="status">
                                {t.text}
                            </div>
                        )
                    }
                </div>

                {
                    dialog &&
                    <div className={"modal-back" + (closing ? " closing" : "")} onClick={() => answer(false)}>
                        <div className="dlg" role="alertdialog" aria-modal="true" aria-labelledby="modal-title" onClick={e => e.stopPropagation()}>
                            <h3 id="modal-title">{dialog.title}</h3>
                            <p>{dialog.text}</p>
                            <div className="modal-acts">
                                <button className="pill" onClick={() => answer(false)}>Cancel</button>
                                <button ref={confirmBtn} className="pill pill-gold danger" onClick={() => answer(true)}>{dialog.button || "Confirm"}</button>
                            </div>
                        </div>
                    </div>
                }

            </ConfirmContext.Provider>
        </ToastContext.Provider>
    )
}


export default UiProvider;
