import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
  type FormEvent,
  type MutableRefObject,
  type ReactNode,
} from "react";

export type ModalFormField =
  | {
      id: string;
      label: string;
      type: "text";
      placeholder?: string;
      defaultValue?: string;
      /** When true, empty value is allowed on submit. */
      optional?: boolean;
    }
  | {
      id: string;
      label: string;
      type: "select";
      options: { value: string; label: string }[];
      defaultValue?: string;
    };

export type OpenFormOptions = {
  title: string;
  fields: ModalFormField[];
  submitLabel?: string;
  cancelLabel?: string;
};

export type ConfirmOptions = {
  title?: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
};

export type AlertOptions = {
  title?: string;
  message: string;
  okLabel?: string;
};

type Pending =
  | { kind: "form"; resolve: (v: Record<string, string> | null) => void }
  | { kind: "confirm"; resolve: (v: boolean) => void }
  | { kind: "alert"; resolve: () => void };

export type AppModalApi = {
  openForm: (opts: OpenFormOptions) => Promise<Record<string, string> | null>;
  confirm: (opts: ConfirmOptions) => Promise<boolean>;
  alert: (opts: AlertOptions) => Promise<void>;
};

const ModalContext = createContext<AppModalApi | null>(null);

export function useModal(): AppModalApi {
  const ctx = useContext(ModalContext);
  if (!ctx) throw new Error("useModal must be used within ModalProvider");
  return ctx;
}

type ActiveState =
  | {
      kind: "form";
      title: string;
      fields: ModalFormField[];
      submitLabel: string;
      cancelLabel: string;
    }
  | {
      kind: "confirm";
      title: string;
      message: string;
      confirmLabel: string;
      cancelLabel: string;
    }
  | {
      kind: "alert";
      title: string;
      message: string;
      okLabel: string;
    };

function initialFormValues(fields: ModalFormField[]): Record<string, string> {
  const v: Record<string, string> = {};
  for (const f of fields) {
    if (f.type === "text") v[f.id] = f.defaultValue ?? "";
    else v[f.id] = f.defaultValue ?? f.options[0]?.value ?? "";
  }
  return v;
}

function ModalLayer({
  active,
  pendingRef,
  setActive,
}: {
  active: ActiveState;
  pendingRef: MutableRefObject<Pending | null>;
  setActive: (v: ActiveState | null) => void;
}): JSX.Element {
  const [values, setValues] = useState<Record<string, string>>(() =>
    active.kind === "form" ? initialFormValues(active.fields) : {}
  );
  const [formError, setFormError] = useState("");

  const dismissForm = (result: Record<string, string> | null): void => {
    const p = pendingRef.current;
    pendingRef.current = null;
    setActive(null);
    if (p?.kind === "form") p.resolve(result);
  };

  const dismissConfirm = (ok: boolean): void => {
    const p = pendingRef.current;
    pendingRef.current = null;
    setActive(null);
    if (p?.kind === "confirm") p.resolve(ok);
  };

  const dismissAlert = (): void => {
    const p = pendingRef.current;
    pendingRef.current = null;
    setActive(null);
    if (p?.kind === "alert") p.resolve();
  };

  const onFormSubmit = (e: FormEvent): void => {
    e.preventDefault();
    if (active.kind !== "form") return;
    setFormError("");
    for (const f of active.fields) {
      const raw = (values[f.id] ?? "").trim();
      if (f.type === "text" && !raw && !f.optional) {
        setFormError(`Please enter ${f.label.toLowerCase()}.`);
        return;
      }
      if (f.type === "select" && !raw) {
        setFormError(`Please choose ${f.label.toLowerCase()}.`);
        return;
      }
    }
    const out: Record<string, string> = {};
    for (const f of active.fields) {
      out[f.id] = (values[f.id] ?? "").trim();
    }
    dismissForm(out);
  };

  if (active.kind === "alert") {
    return (
      <div className="appModalRoot" role="presentation">
        <div className="appModalBackdrop" aria-hidden />
        <div
          className="appModalPanel"
          role="alertdialog"
          aria-labelledby="appModalAlertTitle"
          aria-describedby="appModalAlertMsg"
          onClick={(e) => e.stopPropagation()}
        >
          <h2 id="appModalAlertTitle" className="appModalTitle">
            {active.title}
          </h2>
          <p id="appModalAlertMsg" className="appModalMessage">
            {active.message}
          </p>
          <div className="appModalActions">
            <button className="appModalBtn primary" type="button" onClick={dismissAlert}>
              {active.okLabel}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (active.kind === "confirm") {
    return (
      <div className="appModalRoot" role="presentation">
        <div className="appModalBackdrop" aria-hidden />
        <div
          className="appModalPanel"
          role="alertdialog"
          aria-labelledby="appModalConfirmTitle"
          aria-describedby="appModalConfirmMsg"
          onClick={(e) => e.stopPropagation()}
        >
          <h2 id="appModalConfirmTitle" className="appModalTitle">
            {active.title}
          </h2>
          <p id="appModalConfirmMsg" className="appModalMessage">
            {active.message}
          </p>
          <div className="appModalActions">
            <button className="appModalBtn ghost" type="button" onClick={() => dismissConfirm(false)}>
              {active.cancelLabel}
            </button>
            <button className="appModalBtn danger" type="button" onClick={() => dismissConfirm(true)}>
              {active.confirmLabel}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="appModalRoot" role="presentation">
      <div className="appModalBackdrop" aria-hidden />
      <div
        className="appModalPanel"
        role="dialog"
        aria-labelledby="appModalFormTitle"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="appModalFormTitle" className="appModalTitle">
          {active.title}
        </h2>
        <form className="appModalForm" onSubmit={onFormSubmit}>
          {active.fields.map((f) => (
            <label key={f.id} className="appModalField">
              <span className="appModalLabel">{f.label}</span>
              {f.type === "text" ? (
                <input
                  className="appModalInput"
                  type="text"
                  value={values[f.id] ?? ""}
                  placeholder={f.placeholder}
                  onChange={(e) => setValues((prev) => ({ ...prev, [f.id]: e.target.value }))}
                  autoComplete="off"
                />
              ) : (
                <select
                  className="appModalInput appModalSelect"
                  value={values[f.id] ?? ""}
                  onChange={(e) => setValues((prev) => ({ ...prev, [f.id]: e.target.value }))}
                >
                  {f.options.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              )}
            </label>
          ))}
          {formError ? <p className="appModalError">{formError}</p> : null}
          <div className="appModalActions">
            <button className="appModalBtn ghost" type="button" onClick={() => dismissForm(null)}>
              {active.cancelLabel}
            </button>
            <button className="appModalBtn primary" type="submit">
              {active.submitLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function ModalProvider({ children }: { children: ReactNode }): JSX.Element {
  const [active, setActive] = useState<ActiveState | null>(null);
  const pendingRef = useRef<Pending | null>(null);

  const openForm = useCallback((opts: OpenFormOptions) => {
    return new Promise<Record<string, string> | null>((resolve) => {
      pendingRef.current = { kind: "form", resolve };
      setActive({
        kind: "form",
        title: opts.title,
        fields: opts.fields,
        submitLabel: opts.submitLabel ?? "Save",
        cancelLabel: opts.cancelLabel ?? "Cancel",
      });
    });
  }, []);

  const confirm = useCallback((opts: ConfirmOptions) => {
    return new Promise<boolean>((resolve) => {
      pendingRef.current = { kind: "confirm", resolve };
      setActive({
        kind: "confirm",
        title: opts.title ?? "Confirm",
        message: opts.message,
        confirmLabel: opts.confirmLabel ?? "OK",
        cancelLabel: opts.cancelLabel ?? "Cancel",
      });
    });
  }, []);

  const alertFn = useCallback((opts: AlertOptions) => {
    return new Promise<void>((resolve) => {
      pendingRef.current = { kind: "alert", resolve };
      setActive({
        kind: "alert",
        title: opts.title ?? "Notice",
        message: opts.message,
        okLabel: opts.okLabel ?? "OK",
      });
    });
  }, []);

  const api: AppModalApi = { openForm, confirm, alert: alertFn };

  return (
    <ModalContext.Provider value={api}>
      {children}
      {active ? (
        <ModalLayer active={active} pendingRef={pendingRef} setActive={setActive} />
      ) : null}
    </ModalContext.Provider>
  );
}
