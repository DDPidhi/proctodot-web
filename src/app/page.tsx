import { redirect } from 'next/navigation';
import {Routes} from "@/constants/enums";

const Home = () => {
  redirect(Routes.Register);
};

export default Home;
