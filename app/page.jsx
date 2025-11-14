import Image from "next/image";
import Hello from "./client/components/Navbar";

export default function Home() {
  console.log("this is server");
  return (
    <>
    <h1>Hello this is the Homepage</h1>
    <Hello/>
    </>
  
  );
}
