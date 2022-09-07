import {User} from "../../../types/types";
import {SwipeableList, SwipeableListItem} from "@sandstreamdev/react-swipeable-list";
import CheckIcon from '@mui/icons-material/Check';
import ClearIcon from '@mui/icons-material/Clear';
import styles from './TeamCadetsList.module.css';
import {useState} from "react";
import {Slide} from "@mui/material";
import classNames from 'classnames/bind';

let cx = classNames.bind(styles);

type Props = {
    teamCadets: User[] | undefined,
    updateAttendances: Function,
    setChosenEditCadet: Function,
    setIsMissingCadetModalOpen: Function
};

export const TeamCadetsList = ({
                                   teamCadets,
                                   updateAttendances,
                                   setChosenEditCadet,
                                   setIsMissingCadetModalOpen
                               }: Props) => {
    const [isSliding, setIsSliding] = useState(false);

    const swipeRightContent = <div className={cx(styles.swipeRightContent, styles.swipeableContent)}>
        <Slide direction="up" in={isSliding}>
            <ClearIcon sx={{color: 'white', paddingRight: '10px'}}/>
        </Slide>
    </div>;

    const swipeLeftContent = <div className={cx(styles.swipeLeftContent, styles.swipeableContent)}>
        <Slide direction="up" in={isSliding}>
            <CheckIcon sx={{color: 'white', paddingLeft: '10px'}}/>
        </Slide>
    </div>;

    const swipeRightOptions = (cadet: User) => ({
        action: () => {
            setChosenEditCadet([cadet]);
            setIsMissingCadetModalOpen(true);
        },
        content: swipeRightContent
    });

    const swipeLeftOptions = (cadet: User) => ({
        action: () => {
            cadet.attendance.inAttendance = true;
            updateAttendances([cadet.attendance]);
        },
        content: swipeLeftContent
    });

    return (
        <div className={styles.listContainer}>
            <SwipeableList>
                {
                    teamCadets?.map(cadet => {
                        return (
                            <SwipeableListItem swipeRight={swipeRightOptions(cadet)}
                                               swipeLeft={swipeLeftOptions(cadet)}
                                               onSwipeStart={() => setIsSliding(true)}
                                               onSwipeEnd={() => setIsSliding(false)}
                                               onSwipeProgress={progress => {
                                                   if (progress === 0) setIsSliding(false)
                                               }}>
                                <div
                                    className={cx(styles.listItemContent,
                                        {[styles.missingCadet]: cadet.attendance.inAttendance === false},
                                        {[styles.presentCadet]: cadet.attendance.inAttendance === true},
                                        {[styles.unknownStatusCadet]: cadet.attendance.inAttendance === null})}>
                                    <p>{`${cadet.firstName} ${cadet.lastName}`}</p>
                                    {!cadet.attendance.inAttendance &&
                                    <p className={styles.attendanceReason}>{cadet.attendance.reason}</p>}
                                </div>
                            </SwipeableListItem>);
                    })
                }
            </SwipeableList>
        </div>
    );
}
