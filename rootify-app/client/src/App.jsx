import { useEffect, useState } from "react";
import axios from "axios";

function App() {
  const [message, setMessage] = useState("");
  useEffect(() => {
  axios.get("/api/test")
    .then(res => setMessage(res.data.message))
    .catch(console.error);
}, []);

return <div>{message}</div>;

}

export default App;