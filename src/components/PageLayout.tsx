import { FunctionComponent } from "react";

const PageLayout: FunctionComponent<{ title: string }> = ({
  title,
  children,
}) => {
  return (
    <div className="w-full h-full overflow-scroll">
      <h1 className="font-bold text-2xl mb-4 p-3">{title}</h1>
      {children}
    </div>
  );
};

export default PageLayout;
