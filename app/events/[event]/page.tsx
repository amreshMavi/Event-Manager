"use client";

import { useEffect, useState } from "react";
import { ID, Models } from "appwrite";
import AppwriteConfig from "../../constants/appwrite_config";

import { useRouter } from "next/navigation";
import Header from "@/app/components/header";
import swal from 'sweetalert';


export default function Event({ params }: { params: { event: string } }) {
  const appwriteConfig = new AppwriteConfig();

  const [docs, setDocs] = useState<Models.Document>();
  const [loader, setLoader] = useState(false);

  const [reg, setReg] = useState<string[]>();
  const [isReg, setIsReg] = useState(false);

  const router = useRouter();

  useEffect(() => {
    setLoader(true);
    const getDocs = appwriteConfig.databases
      .getDocument(
        `${process.env.NEXT_PUBLIC_DATABASEID}`,
        `${process.env.NEXT_PUBLIC_EVENT_COLLID}`,
        params["event"]
      )
      .then(
        function (response) {
          setDocs(response);
          setReg(response["registrations"]);

          if (
            response["registrations"].includes(
              JSON.parse(localStorage.getItem("userInfo") || "{}").$id
            )
          ) {
            setIsReg(true);
          }
        },
        function (error) {
          console.log(error);
        }
      );
    setLoader(false);
  }, []);

  return (
    <div className="bg-gray-100 min-h-screen">
      <Header />
      {loader ? (
        <p className="mx-auto text-red-700">Loadings....</p>
      ) : (
        <main className="container mx-auto px-4 py-8">
          <div className="bg-white shadow-lg rounded-lg overflow-hidden">
            <img
              src={docs && docs["url"]}
              alt="Event Image"
              className="object-cover object-center rounded"
            />
            <div className="p-6">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                {docs && docs["eventname"]}
              </h2>
              <div className="flex flex-wrap mb-4">
                <div className="w-full sm:w-1/2">
                  <p className="text-gray-600">
                    <span className="font-semibold">Date:</span>{" "}
                    {docs && docs["eventdate"]}
                  </p>
                  <p className="text-gray-600">
                    <span className="font-semibold">Approval Required :</span>{" "}
                    {docs && docs["approval"]}
                  </p>
                </div>
                <div className="w-full sm:w-1/2">
                  <p className="text-gray-600">
                    <span className="font-semibold">Type:</span>{" "}
                    {docs && docs["type"]}
                  </p>
                  <p className="text-gray-600">
                    <span className="font-semibold">Audience:</span>{" "}
                    {docs && docs["audience"]}
                  </p>
                </div>
              </div>
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  Event Description
                </h3>
                <p className="text-gray-600">{docs && docs["description"]}</p>
              </div>
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  Sponsors
                </h3>
                <ul className="list-disc pl-6 text-gray-600">
                  <li> {docs && docs["sponsor1"]}</li>
                  <li> {docs && docs["sponsor2"]}</li>
                  <li> {docs && docs["sponsor3"]}</li>
                </ul>
              </div>
              <div className="text-center flex space-x-3 justify-center">
                {isReg ? (
                  <button
                    className="bg-[#DB195A] text-white font-bold py-2 px-4 rounded "
                    onClick={() => {
                      alert("Your Are alredy registered");
                    }}
                  >
                    Registered
                  </button>
                ) : (
                  <button
                    className="bg-[#DB195A] text-white font-bold py-2 px-4 rounded "
                    onClick={() => {
                      reg?.push(
                        JSON.parse(localStorage.getItem("userInfo") || "{}").$id
                      );
                      appwriteConfig.databases.updateDocument(
                        `${process.env.NEXT_PUBLIC_DATABASEID}`,
                        `${process.env.NEXT_PUBLIC_EVENT_COLLID}`,
                        params["event"],
                        {
                          registrations: reg,
                        }
                      ).then(() => {
                        appwriteConfig.regDb.createDocument(
                          `${process.env.NEXT_PUBLIC_REGDB}`,
                          params["event"],
                          JSON.parse(localStorage.getItem("userInfo") || "{}").$id,
                          {
                            name: JSON.parse(localStorage.getItem("userInfo") || "").name,
                            email: JSON.parse(localStorage.getItem("userInfo") || "").email,
                          }
                          
                        ).then((res) => {
                          router.push("/events/sucessreg");
                        });
                      });
                    }}
                  >
                    Register
                  </button>
                )}
                <a>
                  <button className="bg-[#F3F4F6] text-black font-bold py-2 px-5 rounded" onClick={() => {
                      return swal("Good job!", "You can contact host", "success", {
                        
                      });
                    }}>
                    Contact Host
                  </button>
                </a>
              </div>
            </div>
          </div>
        </main>
      )}
    </div>
  );
}
