/** This makes ts-loader work on assets. */
declare module "*.jpg" {
  const content: any;
  export default content;
}