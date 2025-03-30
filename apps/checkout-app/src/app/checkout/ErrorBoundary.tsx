import React, { PropsWithChildren } from "react";
import ErrorRetry from "@/app/error/ErrorRetry";
import { Trans } from "@lingui/react";

interface ErrorBoundaryState {
  hasError: boolean;
}

class ErrorBoundary extends React.Component<
  PropsWithChildren,
  ErrorBoundaryState
> {
  constructor(props: PropsWithChildren) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <ErrorRetry
          detail={<Trans id="payment.failure" />}
          token={"page"}
          reference="page"
        />
      );
    }
    return this.props.children;
  }
}
export default ErrorBoundary;
