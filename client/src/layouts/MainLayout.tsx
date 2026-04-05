import { ReactNode } from "react";

type Props = {
  children: ReactNode;
};

export default function MainLayout({ children }: Props) {
  return (
    <div>
      <header>
        <h1>Valle Leads System</h1>
      </header>
      <main>{children}</main>
    </div>
  );
}