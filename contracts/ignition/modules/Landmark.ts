import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const LandmarkModule = buildModule("LandmarkDeployment", (m) => {
  const deployer = m.getAccount(0);
  const visitToken = m.contract("VisitToken", [deployer]);

  const landmarkRegistry = m.contract("LandmarkRegistry", [visitToken]);

  return { visitToken, landmarkRegistry };
});

export default LandmarkModule;