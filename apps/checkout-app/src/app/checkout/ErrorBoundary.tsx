import React, { PropsWithChildren } from 'react';
import ErrorRetry from '@/app/error/ErrorRetry';
import { i18n } from '@lingui/core';

interface ErrorBoundaryState {
  hasError: boolean;
}

class ErrorBoundary extends React.Component<PropsWithChildren, ErrorBoundaryState> {
  constructor(props: PropsWithChildren) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return <ErrorRetry
        detail={i18n.t({ id: "error.general" })}
        token={"page"}
        reference='page'
      />;
    }
    return this.props.children;
  }
}
export default ErrorBoundary;
