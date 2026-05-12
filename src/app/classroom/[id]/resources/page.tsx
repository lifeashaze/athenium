import CourseResourcesClient from "./_components/CourseResourcesClient";

export default function CourseResourcesPage({ params }: { params: { id: string } }) {
  return <CourseResourcesClient params={params} />;
}
