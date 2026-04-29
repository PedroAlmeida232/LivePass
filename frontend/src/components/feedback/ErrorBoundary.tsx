"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { Button } from "../ui/Button";

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-bg flex items-center justify-center p-4">
          <div className="glass-strong rounded-3xl p-12 max-w-md w-full text-center space-y-6 border border-error/20">
            <div className="w-20 h-20 bg-error/10 rounded-full flex items-center justify-center mx-auto text-error text-4xl">
              !
            </div>
            <div>
              <h2 className="font-display text-display-md text-text-primary mb-2">Ops! Algo deu errado.</h2>
              <p className="text-body-sm text-text-secondary">
                Ocorreu um erro inesperado na aplicação. Nossa equipe técnica já foi notificada.
              </p>
            </div>
            <div className="bg-black/20 rounded-xl p-4 text-left overflow-hidden">
              <p className="text-[10px] font-mono text-error uppercase mb-1">Erro:</p>
              <p className="text-xs font-mono text-text-muted break-all">
                {this.state.error?.message || "Erro desconhecido"}
              </p>
            </div>
            <Button
              className="w-full"
              onClick={() => window.location.reload()}
            >
              Recarregar Página
            </Button>
          </div>
        </div>
      );
    }

    return this.children;
  }
}
