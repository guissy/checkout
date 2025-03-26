import React from 'react';

const NotFound: React.FC = () => {
  return (
    <main>
      <header className="h(--header-h) invisible" />
      <div className="flex flex-col items-center justify-center text-center my-12 mx-6">
        <h1 className="font-bold text-5xl my-8"> 404 </h1>
        <h1 className="text-xl md:text-2xl mt-8">
          Oops... You just found an error page
        </h1>
        <p className="text-base md:text-lg my-6">
          The page you were looking for could not be found. We may have deleted or moved this page. Or the link never
          existed.
        </p>
      </div>
    </main>
  );
};

export default NotFound;
