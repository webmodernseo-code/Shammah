import BlogSingle from "@/components/blogs/BlogSingle";
import RelatedBlogs from "@/components/blogs/RelatedBlogs";
import Footer1 from "@/components/footers/Footer1";
import Header2 from "@/components/headers/Header2";
import Topbar4 from "@/components/headers/Topbar4";
import { allBlogs } from "@/data/blogs";
import React from "react";

export const metadata = {
  title: "Blog Single || Shammah - Print On Demand E-Commerce",
  description: "Shammah - Print On Demand E-Commerce",
};
export default async function BlogDetailsPage1({ params }) {
  const { id } = await params;

  const blog = allBlogs.filter((p) => p.id == id)[0] || allBlogs[0];
  return (
    <>
      <Topbar4 parentClass="tf-topbar bg-brown topbar-bg marquee-topbar" />
      <Header2 />
      <BlogSingle blog={blog} />
      <RelatedBlogs />
      <Footer1 />
    </>
  );
}
