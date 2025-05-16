'use client';
import React, {FormEvent, useState} from "react";
import {Routes, UserType} from "@/constants/enums";
import {useRouter} from "next/navigation";
import apiManager from "@/core/services/apiManager";

const Register: React.FC = () => {
  const router = useRouter();

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    chain: '',
    phone: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({...form, [e.target.name]: e.target.value});
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const {lastName, firstName, chain, phone, email, password} = form;
    console.log(

    );

    const userData = {
      email,
      password,
      first_name: firstName,
      last_name: lastName,
      chain,
      phone,
    };

    console.log(userData);

    try {
      const res = await apiManager.registerUser(userData, UserType.Member);
      router.push(Routes.Questionnaire);
    } catch (err: any) {
      alert(`message: ${err.response?.data?.message}`);
      console.error('register failed:', err);
    }
  };

  const handleLoginNavigation = () => {
    router.push(Routes.Login);
  }

  return (

      <div className="min-h-screen flex flex-col items-center justify-start bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        {/* Logo + Brand */}
        <div className="mb-8 flex items-center space-x-2">
          <span className="text-3xl">🎓️</span>
          <h1 className="text-2xl font-bold text-gray-700">ProctoDot</h1>
        </div>

        {/* Form Container */}
        <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
          <h2 className="text-2xl font-bold mb-6 text-center">Create an Account</h2>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-medium">First Name</label>
              <input
                type="text"
                name="firstName"
                value={form.firstName}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 rounded-md border border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium">Last Name</label>
              <input
                type="text"
                name="lastName"
                value={form.lastName}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 rounded-md border border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium">Email</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 rounded-md border border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium">Password</label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 rounded-md border border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium">Chain</label>
              <select
                name="chain"
                value={form.chain}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 rounded-md border border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                required
              >
                <option value="" disabled>Select your chain</option>
                <option value="polkadot">Polkadot</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium">Phone Number</label>
              <input
                type="tel"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 rounded-md border border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-[#27616e] text-white py-2 rounded-md hover:bg-[#20464f]"
            >
              Register
            </button>
          </form>
        </div>

        <button onClick={handleLoginNavigation} className={"mt-2 cursor-pointer hover:underline"}>Already have an
          account? Log in here
        </button>
      </div>
  )
}

export default Register;
