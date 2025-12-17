import { ReactNode, useContext } from "react";
import { BottomNav, ProfileSidebar } from "../components";
import { UserContext } from "../contexts/UserContext";

interface MainLayoutProps {
  children: ReactNode;
}

const MainLayout = ({ children }: MainLayoutProps) => {
  const { isAuthenticated } = useContext(UserContext);
  return (
    <>
      {isAuthenticated ? (
        <>
          <ProfileSidebar />
          {children}
          <div style={{ marginTop: "128px" }} />
          <BottomNav />
        </>
      ) : (
        <>{children}</>
      )}
    </>
  );
};

export default MainLayout;
