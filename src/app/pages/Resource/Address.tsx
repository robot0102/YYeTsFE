import * as React from "react";
import { Skeleton, TabContext, TabList, TabPanel } from "@material-ui/lab";
import { AppBar, Button, createStyles, makeStyles, Menu, MenuItem, Tab, Theme, Typography } from "@material-ui/core";
import { ExpandMore as ExpandMoreIcon } from "@material-ui/icons";
import { usePopupState, bindTrigger, bindMenu } from "material-ui-popup-state/hooks";

import { AddressInfo } from "API";
import { toAbsoluteUrl } from "utils";
import { DataTableComponent } from "./DataTable";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      minHeight: 300,
      backgroundColor: theme.palette.background.paper,
    },
    appRoot: {
      boxShadow: theme.shadows[1],
    },
    empty: {
      minHeight: 300,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
    },
    header: {
      alignItems: "center",
      flexDirection: "row",
    },
    tabRoot: {
      minWidth: "100px",
    },
    tabPanelRoot: {
      padding: 0,
    },
  })
);

interface AddressPropTypes {
  loading: boolean;
  resourceAddress: Array<AddressInfo>;
}
export function AddressComponent(props: AddressPropTypes) {
  const { loading, resourceAddress = [] } = props;

  const [season, setSeason] = React.useState<number>(0);
  const [quality, setQuality] = React.useState<string>("");
  const [qualityIndex, setQualityIndex] = React.useState<string>("1");

  const popupState = usePopupState({ variant: "popover", popupId: "demoMenu" });

  console.log("资源地址", resourceAddress);

  const handleQualityChange = (event: React.ChangeEvent<{}>, newValue: string) => {
    setQualityIndex(newValue);
    setQuality(resourceAddress[season].formats[Number(newValue) - 1]);
  };

  const handleChangeSeason = (seasonIndex: number) => {
    setSeason(seasonIndex);
    setQuality(resourceAddress[seasonIndex].formats[0]);
    setQualityIndex("1");
    popupState.close();
  };

  React.useEffect(() => {
    if (resourceAddress.length) {
      setQuality(resourceAddress[season].formats[0]);
    }
  }, [resourceAddress]);

  const classes = useStyles();

  if (loading) return <Skeleton variant="rect" width="100%" height={300} />;

  return resourceAddress.length > 0 ? (
    <div className={classes.root}>
      <TabContext value={qualityIndex}>
        <AppBar position="static" className={classes.header} color="default" classes={{ root: classes.appRoot }}>
          <Menu {...bindMenu(popupState)}>
            {resourceAddress.map((item, index) => (
              <MenuItem onClick={() => handleChangeSeason(index)} key={item.season_cn}>
                {item.season_cn}
              </MenuItem>
            ))}
          </Menu>

          <Button size="large" {...bindTrigger(popupState)}>
            {resourceAddress[season].season_cn}
            <ExpandMoreIcon />
          </Button>
          <TabList
            onChange={handleQualityChange}
            scrollButtons="auto"
            indicatorColor="primary"
            textColor="primary"
            style={{ flex: 1 }}
          >
            {resourceAddress[season].formats.map((item, index) => (
              <Tab label={item} value={String(index + 1)} className={classes.tabRoot} key={item} />
            ))}
          </TabList>
        </AppBar>

        {resourceAddress[season] &&
          resourceAddress[season].formats.map((item, index) => (
            <TabPanel value={String(index + 1)} key={item} classes={{ root: classes.tabPanelRoot }}>
              <DataTableComponent
                tableData={resourceAddress[season].items[quality]}
                season={resourceAddress[season].season_cn}
              />
            </TabPanel>
          ))}
      </TabContext>
    </div>
  ) : (
    <div className={classes.empty}>
      <img src={toAbsoluteUrl("/svg/emptyAddress.svg")} alt="empty" height={200} />
      <Typography style={{ marginTop: "24px" }}>暂无资源，敬请期待</Typography>
    </div>
  );
}
