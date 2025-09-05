import React from "react";

const RenderIf = ({ isShow, children }) => {
  return isShow ? <>{children}</> : null;
};

export default RenderIf;
