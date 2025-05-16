'use client';
import React, {FormEvent, useState} from "react";
import {Routes} from "@/constants/enums";
import {useRouter} from "next/navigation";

const Login: React.FC = () => {
  const router = useRouter();

  const [form, setForm] = useState({
    email: '',
    password: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({...form, [e.target.name]: e.target.value});
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const {email, password} = form;
    console.log(JSON.stringify({email, password}));

    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({email, password}),
      });

      if(res.ok){
        const responseBody = await res.json();
        if(responseBody.data.user.type === "member") {
          router.push(Routes.Questionnaire);
        } else {
          router.push(Routes.WaitingRoom);
        }
      } else{
        console.error('Login failed');
        alert(`message: Login failed`);
      }
    } catch (err: any) {
      alert(`message: ${err.response?.data?.message}`);
      console.error('Login failed:', err);
    }
  };

  const handleRegisterNavigation = () => {
    router.push(Routes.Register);
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-sm text-center">
        <h2 className="text-2xl font-bold mb-6">Welcome to ProctoDot</h2>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#20464f]"
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#20464f]"
            required
          />
          <button
            type="submit"
            className="w-full bg-[#27616e]  text-white py-2 rounded-md hover:bg-[#20464f] transition"
          >
            Log In
          </button>
        </form>

        <div className="mt-4">
          <a href="#" className="text-sm text-black hover:underline">
            Forgot your password?
          </a>
        </div>
      </div>

      <button onClick={handleRegisterNavigation} className={"mt-2 cursor-pointer hover:underline"}>Don’t have an
        account? Register here
      </button>
    </div>
  )
}

export default Login;
