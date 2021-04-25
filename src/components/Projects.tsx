import { FunctionComponent } from "react";
import { GoProject } from "react-icons/go";
import PageLayout from "./PageLayout";

const Projects: FunctionComponent = () => {
  return <PageLayout title="Projects" icon={GoProject}>Projects Component</PageLayout>;
};

export default Projects;
