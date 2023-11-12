import { Typography, Card, CardContent, Grid, Avatar } from "@mui/joy";

function DesktopFallback() {
  return (
    <>
      <Grid
        container
        direction="column"
        justifyContent="center"
        alignItems="center"
      >
        <Card variant="soft" color="warning">
          <CardContent>
            <Typography variant="h2">
              In order to YoMove, please use mobile device!
            </Typography>
          </CardContent>
        </Card>
        <Avatar src="https://res.cloudinary.com/dpajrrxiq/image/upload/w_100,h_100,c_fill,q_70/v1699741218/squat_bejdrv.png" />
      </Grid>
    </>
  );
}

export default DesktopFallback;
