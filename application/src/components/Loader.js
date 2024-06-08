import "./Loader.css";
import LOTUS_IMG from "./lotus-loading.gif";

const Loader = (props) => {
  return (
    <>
      {props.visible && (
        <div className="loader">
          <div className="loader-bubble">
            <img src={LOTUS_IMG} alt="loading" />
          </div>
        </div>
      )}
    </>
  );
};

export default Loader;
