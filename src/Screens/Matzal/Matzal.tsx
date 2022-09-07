import {Box, IconButton, Stack, styled, Typography, TypographyProps} from "@mui/material";
import {useEffect, useMemo, useState} from "react";
import {PageTitle} from "../../Common/PageTitle/PageTitle";
import {SocketIOService} from "../../Services/SocketIOService";
import {UnitService} from "../../Services/UnitService";
import {Attendance, Unit, User} from "../../types/types";
import {AddMissingCadetModal} from "./AddMissingCadetModal/AddMissingCadetModal";
import {ConfirmationModal} from "./ConfirmationModal";
import {CleaningServices, PersonRemove} from "@mui/icons-material";
import {AttendanceService} from "../../Services/AttendanceService";
import {CenteredFlexBox} from "../../Common/CenteredFlexBox/CenteredFlexBox";
import HOME_BACKGROUND from "../../Images/homeBackground.png";
import MATZAL_HEADER_SHAPE from "../../Images/matzalHeaderShape.svg";
import {toast} from "react-toastify";
import {TeamCadetsList} from "./TeamCadetsList/TeamCadetsList";

const MaskedBox = styled(Box)(({theme}) => ({
    position: "relative",
    width: "85%",
    minWidth: "200px",
    maxWidth: "600px",
    aspectRatio: "100 / 52.95",
    backgroundColor: "#00D1AC",
    backgroundImage: `url(${HOME_BACKGROUND})`,
    maskImage: `url(${MATZAL_HEADER_SHAPE})`,
}));

const StyledActionButton = styled(IconButton)(({theme}) => ({
    background: "#00D1AC",
    position: "absolute",
    top: "69%",
    borderRadius: "100%",
    width: "15%",
    aspectRatio: "1 / 1",
}));

const AddMissingCadetButton = styled(StyledActionButton)(({theme}) => ({
    right: "25%",
    transform: "translateX(50%)",
}));

const ClearCadetsButton = styled(StyledActionButton)(({theme}) => ({
    left: "25%",
    transform: "translateX(-50%)",
}));

const MatzalHeaderInfoText = styled(Typography)(({theme}) => ({
    fontWeight: "bold",
    fontSize: "3rem",
    [theme.breakpoints.down("sm")]: {
        fontSize: "2rem",
    },
    m: 0,
}));

const MatzalHeaderInfoLabel = styled((props: TypographyProps) => (
    /** @ts-ignore Apparantly an error within MUI https://github.com/mui/material-ui/issues/20373 */
    <Typography {...props} component="div"/>
))(({theme}) => ({
    display: "block",
    position: "relative",
    color: "white",
    textAlign: "center",
    fontSize: "2rem",
    [theme.breakpoints.down("sm")]: {
        fontSize: "1.5rem",
    },
}));

export const Matzal = () => {
    const [companyWithCadets, setCompanyWithCadets] = useState<Unit>(null!);
    const [chosenEditCadet, setChosenEditCadet] = useState<User[]>([]);
    const [isMissingCadetModalOpen, setIsMissingCadetModalOpen] = useState(false);
    const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);
    const [expanded, setExpanded] = useState<number[]>([]);

    useEffect(() => {
        const fetchCadets = async () => {
            const newCompanyWithCadets = await UnitService.getCadetsInCompany();

            const newCadets = newCompanyWithCadets.children
                .reduce((allMembers, currTeam) => {
                    if (currTeam.teamCadets) allMembers.push(...currTeam.teamCadets);
                    return allMembers;
                }, [] as User[]);

            const newAttendances: Attendance[] = newCadets
                .reduce((attendances, cadet): Attendance[] => {
                        if (cadet.attendance === null) {
                            attendances.push({
                                userId: cadet.id,
                                inAttendance: null,
                                reason: null,
                            });
                        }

                        return attendances;
                    }, [] as Attendance[]
                );

            await updateAttendances(newAttendances);

            setCompanyWithCadets(
                (newAttendances.length > 0)
                    ? await UnitService.getCadetsInCompany()
                    : newCompanyWithCadets
            )
        };

        SocketIOService.socket.on("sendCompany", (company: Unit) => {
            setCompanyWithCadets(company);
        });

        fetchCadets();

        const refetchDataInterval = setInterval(async () => {
            setCompanyWithCadets(await UnitService.getCadetsInCompany());
        }, 5000);

        return () => {
            clearInterval(refetchDataInterval);
        }
    }, []);

    const numberOfCadetsDetails = useMemo(() => {
        let amountOfCadets = 0;
        let amountOfAbsent = 0;

        companyWithCadets?.children.forEach((team) =>
            team.teamCadets?.forEach((cadet) => {
                amountOfCadets++;
                cadet.attendance?.inAttendance === false && amountOfAbsent++;
            })
        );

        return {amountOfAbsent, amountOfCadets};
    }, [companyWithCadets]);

    const handleResetTeam = async (teamId: number) => {
        try {
            await AttendanceService.clearTeam(teamId);
            setCompanyWithCadets(await UnitService.getCadetsInCompany());
        } catch (e) {
            toast.error('אירעה שגיאה בניקוי המצ"ל');
        }
    };

    const updateAttendances = async (attendances: Attendance[]) => {
        attendances.forEach(attendance => {
            if (attendance.inAttendance !== false
                && attendance.reason !== null) {
                attendance.reason = null;
            }
        });

        try {
            await AttendanceService.updateAttendances(attendances);
            setCompanyWithCadets(await UnitService.getCadetsInCompany());
        } catch (e) {
            toast.error("אירעה שגיאה בעדכון הצוערים");
        }
    };

    const toggleExpand = (id: number) => {
        setExpanded((expandedState) =>
            expandedState.includes(id)
                ? expandedState.filter((teamId) => teamId !== id)
                : [...expandedState, id]
        );
    };

    const cadetCompare = (cadet1: User, cadet2: User) => {
        // Order unmarked first
        if (cadet1.attendance.inAttendance !== null
            && cadet2.attendance.inAttendance === null) return 1;
        if (cadet1.attendance.inAttendance === null
            && cadet2.attendance.inAttendance !== null) return -1;

        // Order missings second
        if (cadet1.attendance.inAttendance
            && !cadet2.attendance.inAttendance) return 1;
        if (!cadet1.attendance.inAttendance
            && cadet2.attendance.inAttendance) return -1;

        // Secondary order by full name
        return `${cadet1.firstName} ${cadet1.lastName}`
            .localeCompare(`${cadet2.firstName} ${cadet2.lastName}`);
    };

    return (
        <>
            <PageTitle title={'מצ"ל לחייל'} disableBackButton/>
            <CenteredFlexBox>
                <MaskedBox>
                    <Stack
                        height="80%"
                        direction="row"
                        justifyContent="space-evenly"
                        alignItems="center"
                    >
                        <MatzalHeaderInfoLabel>
                            <MatzalHeaderInfoText>
                                {numberOfCadetsDetails.amountOfAbsent}
                            </MatzalHeaderInfoText>
                            חסרים
                        </MatzalHeaderInfoLabel>
                        <MatzalHeaderInfoLabel>
                            <MatzalHeaderInfoText>
                                {numberOfCadetsDetails.amountOfCadets -
                                numberOfCadetsDetails.amountOfAbsent}
                            </MatzalHeaderInfoText>
                            מצ"ן
                        </MatzalHeaderInfoLabel>
                        <MatzalHeaderInfoLabel>
                            <MatzalHeaderInfoText>
                                {numberOfCadetsDetails.amountOfCadets}
                            </MatzalHeaderInfoText>
                            מצ"ל
                        </MatzalHeaderInfoLabel>
                    </Stack>
                    <AddMissingCadetButton
                        style={{
                            background: "#F6E971",
                        }}
                        onClick={() => {
                            setChosenEditCadet([]);
                            setIsMissingCadetModalOpen(true)
                        }}
                    >
                        <PersonRemove sx={{color: "white"}}/>
                    </AddMissingCadetButton>
                    <ClearCadetsButton
                        style={{
                            background: "#DF6E6E",
                        }}
                        onClick={() => {
                            setIsConfirmationModalOpen(true);
                        }}
                    >
                        <CleaningServices sx={{color: "white"}}/>
                    </ClearCadetsButton>
                </MaskedBox>
            </CenteredFlexBox>
            <Typography
                fontWeight="bold"
                fontSize={32}
                sx={{margin: "4% 0 0 15px"}}
            >
                פירוט
            </Typography>

            {/* swipeable list.
                put the current select team in teamCadets prop. */}
            <TeamCadetsList teamCadets={companyWithCadets?.children[0].teamCadets}
                            updateAttendances={updateAttendances}
                            setChosenEditCadet={setChosenEditCadet}
                            setIsMissingCadetModalOpen={setIsMissingCadetModalOpen}/>

            <AddMissingCadetModal
                teams={companyWithCadets?.children}
                preselectedCadets={chosenEditCadet}
                setCadets={setChosenEditCadet}
                isOpen={isMissingCadetModalOpen}
                handleAddAttendance={updateAttendances}
                onClose={() => {
                    setIsMissingCadetModalOpen(false);
                }}
            />
            <ConfirmationModal
                isOpen={isConfirmationModalOpen}
                onClose={() => {
                    setIsConfirmationModalOpen(false);
                }}
                onApprove={() => {
                    companyWithCadets.children
                        .forEach(team => handleResetTeam(team.id));
                    setIsConfirmationModalOpen(false);
                }}
                onReject={() => {
                    setIsConfirmationModalOpen(false);
                }}
            />
        </>
    );
};
