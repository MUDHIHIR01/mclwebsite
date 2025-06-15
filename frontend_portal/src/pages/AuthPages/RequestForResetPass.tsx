import PageMeta from "../../components/common/PageMeta";
import RequestToResetPassword from "../../components/auth/RequestToResetPassword";

export default function SignIn() {
  return (
    <>
      <PageMeta
        title="MCL"
        description="Mwananchi communication limited cooperate website"
      />
     
        <RequestToResetPassword/>
     
    </>
  );
}
