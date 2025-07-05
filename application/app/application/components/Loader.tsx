import "./Loader.css";
import LOTUS_IMG from "./lotus-loading.gif";
import Image from "next/image";

const Loader = (props: { visible: boolean }) => {
  return (
    <>
      {props.visible && (
        <div className="loader">
          <div className="loader-bubble">
            <Image src={LOTUS_IMG} alt="loading" />
          </div>
        </div>
      )}
    </>
  );
};

export default Loader;
