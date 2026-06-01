declare module "*.css" {
  const content: { [className: string]: string };
  export default content;
}

declare module "*.svg" {
  const content: any;
  export default content;
}

declare module "*.png" {
  const content: any;
  export default content;
}

declare module "@dhis2/app-runtime";
declare module "@dhis2/ui";
declare module "mobx-react";
declare module "react-router-dom";
