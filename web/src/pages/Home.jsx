import "./Home.css"
import { useDispatch, useSelector } from "react-redux";
import { toggle } from "../store";

function Home() {
	const dispatch = useDispatch();
	const lock = useSelector((state) => state.locker.value);

  return (<div className="center">
		<h1>Door is safe</h1>
		<button onClick={() => dispatch(toggle())}>{lock ? "locked" : "unlocked"}</button>
	</div>)
}
export default Home;
