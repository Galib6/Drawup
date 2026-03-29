import Spinner from "@base/components/Spinner";
import { Paths, pathToUrl } from "@base/constants/paths";
import { useValidate } from "@components/auth/lib/hooks";
import { setAuthSession } from "@components/auth/lib/utils";
import { useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { appToast } from "@/lib/appToast";

/**
 * OAuth callback: `provider` + `callbackUrl` (optionally `...?token=...` in the value),
 * or separate `token` / `callbackUrl` query params.
 */
export default function AuthValidate(): JSX.Element {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const ran = useRef(false);

  const provider = searchParams.get("provider") ?? "";
  const callbackUrlWithToken = searchParams.get("callbackUrl") ?? "";
  const merged = callbackUrlWithToken.split("?token=");
  const callbackUrlFromMerged = merged[0] ?? "";
  const tokenFromMerged = merged[1];
  const tokenFromQuery = searchParams.get("token") ?? "";
  const token = (tokenFromMerged ?? tokenFromQuery).trim();
  const callbackUrl =
    callbackUrlFromMerged.trim() !== "" ? callbackUrlFromMerged.trim() : pathToUrl(Paths.root);

  const validate = useValidate({
    config: {
      onSuccess(data) {
        if (data?.success) {
          setAuthSession(data.data);
          void appToast
            .promise(new Promise<void>((resolve) => setTimeout(resolve, 1000)), {
              pending: "Logging in...",
              success: "Login successful!",
              error: "Login failed!",
            })
            .then(() => {
              window.location.replace(callbackUrl);
            });
          return;
        }
        appToast.error(data?.message ?? "Validation failed");
      },
      onError() {
        navigate(`${Paths.auth.login}?callbackUrl=${encodeURIComponent(window.location.href)}`, {
          replace: true,
        });
      },
    },
  });

  const mutateAsyncRef = useRef(validate.mutateAsync);
  mutateAsyncRef.current = validate.mutateAsync;

  useEffect(() => {
    if (ran.current) return;
    if (!token || !provider) {
      navigate(`${Paths.auth.login}?callbackUrl=${encodeURIComponent(window.location.href)}`, {
        replace: true,
      });
      return;
    }
    ran.current = true;
    void mutateAsyncRef.current({ token, provider });
  }, [token, provider, navigate]);

  return (
    <div className="authPage">
      <div className="authValidateCenter">
        <Spinner />
      </div>
    </div>
  );
}
