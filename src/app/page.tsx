import { redirect } from 'next/navigation';
import {Routes} from "@/constants/enums";

const Home = () => {
  redirect(Routes.Login);
};

export default Home;
