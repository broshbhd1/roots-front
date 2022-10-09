import { Container, Grid, Typography } from "@mui/material";

export const FinalView = (prop: { notPresents: Array<any> }) => {
  const getUnknown = () => {
    return prop.notPresents?.filter(
      (cadet) => cadet.attendance.inAttendance == null
    );
  };

  const getMissings = () => {
    return prop.notPresents?.filter(
      (cadet) => cadet.attendance.inAttendance != null
    );
  };

  return (
    <Container sx={{ px: 4 }}>
      <Grid sx={{ mb: 3 }}>
        <Typography sx={{ fontWeight: "bold" }} variant="h5">
          {getMissings().length > 0 ? "חסרים: " : "אין חסרים"}
        </Typography>
        {getMissings()?.map((currMissing) => (
          <Grid container direction="row" key={currMissing.id}>
            <Grid
              sx={{ fontWeight: "bold" }}
              item
            >{`${currMissing.firstName} ${currMissing.lastName} - צוות ${currMissing.teamName} - `}</Grid>
            <Grid item>{currMissing.attendance.reason}</Grid>
          </Grid>
        ))}
      </Grid>
      {getUnknown().length > 0 ? (
        <Grid>
          <Typography sx={{ fontWeight: "bold" }} variant="h5">
            לא דווחו:{" "}
          </Typography>
          {getUnknown()?.map((currUnKnon) => (
            <Grid
              key={currUnKnon.id}
              item
            >{`${currUnKnon.firstName} ${currUnKnon.lastName} - צוות  ${currUnKnon.teamName}`}</Grid>
          ))}
        </Grid>
      ) : (
        <></>
      )}
    </Container>
  );
};
