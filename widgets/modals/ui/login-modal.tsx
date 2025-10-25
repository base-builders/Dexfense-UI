import { useState, FC } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuthStore } from "@/shared";
import { MdClose } from "react-icons/md";
import { decodeJwt } from "@/shared";

type LoginModalProps = {
  onClose: () => void;
};

export const LoginModal: FC<LoginModalProps> = ({ onClose }) => {
  const [visible, setVisible] = useState(true);
  const [address, setAddress] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [isFirst, setIsFirst] = useState<boolean>(false);

  const handleClose = () => {
    setVisible(false);
    setTimeout(onClose, 300);
  };

  const handleButtonClick = () => {
    if (isFirst) {
      handleSignup();
    } else {
      handleLogin();
    }
  };

  const handleSignup = async () => {
    const res = await fetch("/api/users/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ address, password }),
    });
    if (!res.ok) {
      const err = await res.json();
      alert(err.error || "Signup failed");
      return;
    }
    handleClose();
    alert("Signup success! You can now login.");
  };

  const handleLogin = async () => {
    try {
      const res = await fetch("/api/users/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address, password }),
      });

      if (!res.ok) {
        const err = await res.json();
        alert(err.error || "Signin failed");
        return;
      }

      const data = await res.json();
      const userinfo = decodeJwt(data.token);
      useAuthStore.getState().setAuth(userinfo.address, data.token);

      handleClose();
    } catch (error) {
      console.error("❌ Signin error:", error);
      alert("Something went wrong!");
    }
  };

  const outline = { textShadow: "1px 1px 1px #717171" };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed -mt-30 inset-0 bg-[#00000080] backdrop-blur-sm flex items-center justify-center z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="w-[480px] text-white rounded-2xl border-1 border-white  font-start-2p px-6 py-8 text-center bg-gray-900 relative shadow-lg"
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <button
              className="absolute right-4 top-3 text-xl cursor-pointer"
              onClick={handleClose}
              aria-label="Close modal"
            >
              <MdClose />
            </button>

            <h2 className="text-3xl text-white font-bold mb-8" style={outline}>
              {/* {ready ? "Privy is ready" : "loading..."} */}
            </h2>

            <p className="text-white mb-6 leading-snug" style={outline}>
              You&apos;re in the closed beta of DexFense Protocol.
              <br />
              Just enter your trial ID and password
              {/* <br />
              If you are first time here, please enter the secret code you got
              from us – and you&apos;re in */}
              <br />
            </p>

            <p className="text-white mb-6 leading-snug" style={outline}>
              An exclusive airdrop just for our true defenders 🏹 <br />
            </p>

            <hr className="border-t-[2px] border-blue-600 mb-6" />

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleButtonClick();
              }}
            >
              <input
                type="text"
                placeholder="ID"
                className="w-full text-[10px]  mb-4 p-3 rounded-full border-2 border-gray-300 text-black bg-white shadow"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />

              <input
                type="password"
                placeholder="Password"
                className="w-full text-[10px]  mb-6 p-3 rounded-full border-2 border-gray-300 text-black bg-white shadow"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />

              <div className="flex items-center gap-2 mb-4 text-left">
                <input
                  type="checkbox"
                  id="firstTime"
                  checked={isFirst}
                  onChange={(e) => setIsFirst(e.target.checked)}
                  className="w-4 h-4"
                />
                <label
                  htmlFor="firstTime"
                  className="text-sm text-blue-600 text-[10px]  font-semibold"
                >
                  I&apos;m here for the first time (Sign up)
                </label>
              </div>

              <button
                type="submit"
                className="border-blue-600 w-full bg-blue-400 text-white font-bold py-3 px-6 rounded-full hover:opacity-80 transition duration-300"
              >
                🚀 Enter the DexFense
              </button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
