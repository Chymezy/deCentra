import Header from "@/components/Header";
import Footer from "@/components/Footer";

// Generate static params for static export
export async function generateStaticParams() {
  // Generate some sample post IDs for static export
  // In a real app, you might fetch these from your backend
  return [
    { id: '0' },
    { id: '1' },
    { id: '2' },
    { id: '3' },
    { id: '4' },
  ];
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  return (
    <>
      <Header />
      <main className="pt-16 min-h-screen flex flex-col items-center justify-center">
        <h1 className="text-3xl font-bold mb-4">Post ID: {id}</h1>
        <p className="text-lg text-gray-600">Single post details will appear here.</p>
      </main>
      <Footer />
    </>
  );
}
 