import Confirm from "../../forms/Confirm";

export default async function Page(props: {
  params: Promise<{
    teId: string;
  }>;
}) {
  const { teId } = await props.params;
  return <Confirm/>;
}
