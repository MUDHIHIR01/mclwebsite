import PageMeta from "../../components/common/PageMeta";
import RestePassword from "../../components/auth/RestePassword";

export default function SignIn() {
  return (
    <>
      <PageMeta
        title="MCL"
        description="Mwananchi communication limited cooperate website"
      />
     
        <RestePassword />
     
    </>
  );
}
