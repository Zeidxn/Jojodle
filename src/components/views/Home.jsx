import { Link } from "react-router-dom";
import TextCascade from "../menacing_texts/MenacingTexts.jsx";

function Home() {
    return (
        <div className="w_100 h_100 flex items_center justify_center">
            <audio src={"/assets/jjba/soundtrack.mp3"} autoPlay loop />
            <TextCascade />

            <div className="h_75 w_50 flex flex_col items_center justify_center m_x_auto m_y_auto">
                <img className=" h_375 m_8 scale_hover cursor_pointer " src="/assets/jjba/assets/logo.png" alt="Logo" />
                <div className="h_375 w_100 flex flex_col items_center justify_between">
                    <Link to="/classic">
                        <button className="button scale_hover w_25 h_10">Classic</button>
                    </Link>
                    <Link to="/stand">
                        <button className="button scale_hover w_25 h_10">Stand</button>
                    </Link>
                    <Link to="/ability">
                        <button className="button scale_hover w_25 h_10">Ability</button>
                    </Link>
                </div>
            </div>

            <TextCascade />
        </div>
    );
}

export default Home;
