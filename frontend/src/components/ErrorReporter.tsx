"use client";

import { useEffect, useRef } from "react";
import { Container, Button } from "react-bootstrap";

type ReporterProps = {
  /*  ⎯⎯ props are only provided on the global-error page ⎯⎯ */
  error?: Error & { digest?: string };
  reset?: () => void;
};

export default function ErrorReporter({ error, reset }: ReporterProps) {
  /* ─ instrumentation shared by every route ─ */
  const lastOverlayMsg = useRef("");
  const pollRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    const inIframe = window.parent !== window;
    if (!inIframe) return;

    const send = (payload: unknown) => window.parent.postMessage(payload, "*");

    const onError = (e: ErrorEvent) =>
      send({
        type: "ERROR_CAPTURED",
        error: {
          message: e.message,
          stack: e.error?.stack,
          filename: e.filename,
          lineno: e.lineno,
          colno: e.colno,
          source: "window.onerror",
        },
        timestamp: Date.now(),
      });

    const onReject = (e: PromiseRejectionEvent) =>
      send({
        type: "ERROR_CAPTURED",
        error: {
          message: e.reason?.message ?? String(e.reason),
          stack: e.reason?.stack,
          source: "unhandledrejection",
        },
        timestamp: Date.now(),
      });

    const pollOverlay = () => {
      const overlay = document.querySelector("[data-nextjs-dialog-overlay]");
      const node =
        overlay?.querySelector(
          "h1, h2, .error-message, [data-nextjs-dialog-body]"
        ) ?? null;
      const txt = node?.textContent ?? node?.innerHTML ?? "";
      if (txt && txt !== lastOverlayMsg.current) {
        lastOverlayMsg.current = txt;
        send({
          type: "ERROR_CAPTURED",
          error: { message: txt, source: "nextjs-dev-overlay" },
          timestamp: Date.now(),
        });
      }
    };

    window.addEventListener("error", onError);
    window.addEventListener("unhandledrejection", onReject);
    pollRef.current = setInterval(pollOverlay, 1000);

    return () => {
      window.removeEventListener("error", onError);
      window.removeEventListener("unhandledrejection", onReject);
      pollRef.current && clearInterval(pollRef.current);
    };
  }, []);

  /* ─ extra postMessage when on the global-error route ─ */
  useEffect(() => {
    if (!error) return;
    window.parent.postMessage(
      {
        type: "global-error-reset",
        error: {
          message: error.message,
          stack: error.stack,
          digest: error.digest,
          name: error.name,
        },
        timestamp: Date.now(),
        userAgent: navigator.userAgent,
      },
      "*"
    );
  }, [error]);

  /* ─ ordinary pages render nothing ─ */
  if (!error) return null;

  /* ─ global-error UI ─ */
  return (
    <html>
      <head>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css"
        />
      </head>
      <body className="vh-100 d-flex align-items-center justify-content-center p-4 bg-light">
        <Container className="text-center" style={{ maxWidth: 500 }}>
          <div className="mb-4">
            <h1 className="h3 fw-bold text-danger mb-3">
              Something went wrong!
            </h1>
            <p className="text-muted mb-4">
              An unexpected error occurred. Please try again fixing with Orchids
            </p>
            {reset && (
              <Button onClick={() => reset()} variant="primary" className="rounded-pill px-4 py-2 fw-bold border-0" style={{ backgroundColor: "#4399E1" }}>
                Try again
              </Button>
            )}
          </div>
          
          {process.env.NODE_ENV === "development" && (
            <details className="text-start mt-4">
              <summary className="text-muted cursor-pointer small mb-2" style={{ cursor: 'pointer' }}>
                Error details
              </summary>
              <pre className="p-3 bg-white border rounded small overflow-auto text-dark" style={{ maxHeight: 300 }}>
                <div className="fw-bold mb-2">{error.message}</div>
                {error.stack && (
                  <div className="text-muted opacity-75 mt-2" style={{ fontSize: '0.75rem' }}>
                    {error.stack}
                  </div>
                )}
                {error.digest && (
                  <div className="text-muted opacity-75 mt-2" style={{ fontSize: '0.75rem' }}>
                    Digest: {error.digest}
                  </div>
                )}
              </pre>
            </details>
          )}
        </Container>
      </body>
    </html>
  );
}
