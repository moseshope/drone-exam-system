import { Spin } from "antd";

const LoadingMessage = () => {
    return (
        <div className="px-3 py-2 flex flex-row w-full justify-start">
            <div className="px-3 py-2 w-fit lg:max-w-lg flex flex-col  rounded-lg  shadow-slate-200 shadow-sm  text-sm">
                <Spin />
            </div>
        </div>
    );
};

export default LoadingMessage;
