import { Input, Modal, notification, Select } from "antd";
import { useEffect, useState } from "react";
import moment from "moment";
import { getTokenData } from "../../../serviceToken/tokenUtils";
import { updateRoom } from "../../../serviceToken/RoomSERVICE";
import { fetchAllTrainer } from "../../../serviceToken/TrainerSERVICE";
import { fetchAllClubs } from "../../../serviceToken/ClubService";
const { Option } = Select;

const UpdateRoom = (props) => {
    const { isModalUpdateOpen, setIsModalUpdateOpen, dataUpdate, setDataUpdate, loadRoom, token } = props;

    const [club, setClub] = useState(null);
    const [trainer, setTrainer] = useState(null);
    const [roomName, setRoomName] = useState("");
    const [slug, setSlug] = useState("");
    const [capacity, setCapacity] = useState(0);
    const [facilities, setFacilities] = useState("");
    const [status, setStatus] = useState(false);
    const [startTime, setStartTime] = useState(null);
    const [endTime, setEndTime] = useState(null);
    const [clubs, setClubs] = useState([]);
    const [trainers, setTrainers] = useState([]);
    const [error, setErrors] = useState({});
    const tokenData = getTokenData();
    // useEffect để fetch clubs
    const getClubs = async () => {
        try {
            // Kiểm tra token
            if (!tokenData || !tokenData.access_token) {
                console.error("Access token không có sẵn");
                return;
            }

            const response = await fetchAllClubs(tokenData.access_token);
            console.log("Clubs data loaded:", response.data);

            if (response && response.data) {
                setClubs(response.data);
            }
        } catch (error) {
            console.error("Lỗi khi tải clubs:", error);
            setClubs([]);
        }
    };
    useEffect(() => {

        getClubs();
    }, [tokenData.access_token]);

    // useEffect để fetch trainers
    const getTrainers = async () => {
        try {
            // Kiểm tra token
            if (!tokenData || !tokenData.access_token) {
                console.error("Access token không có sẵn");
                return;
            }

            const response = await fetchAllTrainer(tokenData.access_token);
            if (response && response.data) {
                setTrainers(response.data);
                console.log("Trainers data loaded:", response.data);
            }
        } catch (error) {
            console.error("Lỗi khi tải trainers:", error);
            setTrainers([]);
        }
    };
    useEffect(() => {

        getTrainers();
    }, [tokenData.access_token]);

    useEffect(() => {
        if (dataUpdate) {
            setClub(dataUpdate.club.id);
            setTrainer(dataUpdate.trainer.id);
            setRoomName(dataUpdate.roomName);
            setSlug(dataUpdate.slug);
            setCapacity(dataUpdate.capacity);
            setFacilities(dataUpdate.facilities);
            setStatus(dataUpdate.status);
            setStartTime(moment(dataUpdate.startTime, "HH:mm:ss").format("HH:mm"));
            setEndTime(moment(dataUpdate.endTime, "HH:mm:ss").format("HH:mm"));
        }
    }, [dataUpdate]);

    // Thêm useEffect mới
    useEffect(() => {
        if (isModalUpdateOpen) {
            getClubs();
            getTrainers();
        }
    }, [isModalUpdateOpen]);

    const validateField = (field, value) => {
        const newErrors = { ...error };
        switch (field) {
            case "roomName":
                newErrors.roomName = value.trim() ? "" : "Room name is required.";
                break;
            case "slug":
                newErrors.slug = value.trim() ? "" : "Slug is required.";
                break;
            case "capacity":
                newErrors.capacity = Number(value) > 0 ? "" : "Capacity must be greater than 0.";
                break;
            case "club":
                newErrors.club = value ? "" : "Club is required.";
                break;
            case "trainer":
                newErrors.trainer = value ? "" : "Trainer is required.";
                break;
            default:
                break;
        }
        setErrors(newErrors);
    };

    const validateAllFields = () => {
        const newErrors = {
            roomName: roomName.trim() ? "" : "Room name is required.",
            slug: slug.trim() ? "" : "Slug is required.",
            capacity: Number(capacity) > 0 ? "" : "Capacity must be greater than 0.",
            club: club ? "" : "Club is required.",
            trainer: trainer ? "" : "Trainer is required.",
        };

        setErrors(newErrors);
        return Object.values(newErrors).some((err) => err);
    };

    const handleChange = (field, value) => {
        const setters = {
            roomName: setRoomName,
            slug: setSlug,
            capacity: setCapacity,
            facilities: setFacilities,
            status: setStatus,
            club: setClub,
            trainer: setTrainer,
            startTime: setStartTime,
            endTime: setEndTime,
        };

        setters[field]?.(value);
        validateField(field, value);
    };

    const handleSubmitBtn = async () => {
        const hasErrors = validateAllFields();
        if (hasErrors) {
            notification.error({
                message: "Validation Error",
                description: "Please fix the errors in the form before submitting.",
            });
            return;
        }

        const RoomDataPayloadUpdate = {
            club, trainer, roomName, slug, capacity, facilities, status, startTime, endTime
        }

        const res = await updateRoom(
            dataUpdate.id,
            RoomDataPayloadUpdate,
            tokenData.access_token
        );

        if (res.data) {
            notification.success({
                message: "Update Room",
                description: "Room updated successfully.",
            });
            resetAndCloseModal();
            await loadRoom();
        } else {
            notification.error({
                message: "Error Updating Room",
                description: JSON.stringify(res.message),
            });
        }
    };

    const resetAndCloseModal = () => {
        setIsModalUpdateOpen(false);
        setClub(null);
        setTrainer(null);
        setRoomName("");
        setSlug("");
        setCapacity(0);
        setFacilities("");
        setStatus(false);
        setStartTime(null);
        setEndTime(null);
        setErrors({});
        setDataUpdate(null);
    };

    return (
        <Modal
            title="Update Room"
            open={isModalUpdateOpen}
            onOk={handleSubmitBtn}
            onCancel={resetAndCloseModal}
            okText="Update"
            cancelText="Cancel"
            maskClosable={false}
        >
            <div style={{ display: "flex", gap: "15px", flexDirection: "column" }}>
                {/* Club Select */}
                <Select
                    value={club}
                    placeholder="Select branch"
                    onChange={(value) => handleChange("club", value)}
                >
                    {clubs.map((clubItem) => (
                        <Option key={clubItem.id} value={clubItem.id}>
                            {clubItem.name}
                        </Option>
                    ))}
                </Select>
                {error.club && <span style={{ color: "red" }}>{error.club}</span>}

                {/* Trainer Select */}
                <Select
                    value={trainer}
                    placeholder="Select Trainer"
                    onChange={(value) => handleChange("trainer", value)}
                >
                    {trainers.map((trainerItem) => (
                        <Option key={trainerItem.id} value={trainerItem.id}>
                            {trainerItem.fullName}
                        </Option>
                    ))}
                </Select>
                {error.trainer && <span style={{ color: "red" }}>{error.trainer}</span>}

                {/* Room Name */}
                <div>
                    <span>Room Name</span>
                    <Input
                        value={roomName}
                        placeholder="Room Name"
                        onChange={(e) => handleChange("roomName", e.target.value)}
                    />
                    {error.roomName && <span style={{ color: "red" }}>{error.roomName}</span>}
                </div>

                {/* Slug */}
                <div>
                    <span>Slug</span>
                    <Input
                        value={slug}
                        placeholder="Slug"
                        onChange={(e) => handleChange("slug", e.target.value)}
                    />
                    {error.slug && <span style={{ color: "red" }}>{error.slug}</span>}
                </div>

                {/* Capacity */}
                <div>
                    <span>Capacity</span>
                    <Input
                        type="number"
                        value={capacity}
                        placeholder="Capacity"
                        onChange={(e) => handleChange("capacity", e.target.value)}
                    />
                    {error.capacity && <span style={{ color: "red" }}>{error.capacity}</span>}
                </div>

                {/* Facilities */}
                <div>
                    <span>Facilities</span>
                    <Input
                        value={facilities}
                        placeholder="Facilities"
                        onChange={(e) => handleChange("facilities", e.target.value)}
                    />
                </div>

                {/* Status */}
                <div>
                    <span>Status</span>
                    <Select
                        value={status ? "Active" : "Inactive"}
                        placeholder="Status"
                        onChange={(value) => handleChange("status", value === "Active")}
                    >
                        <Option value="Active">Active</Option>
                        <Option value="Inactive">Inactive</Option>
                    </Select>
                </div>

                {/* Time */}
                <div>
                    <span>Start Time</span>
                    <Input
                        type="time"
                        value={startTime}
                        placeholder="Start Time"
                        onChange={(e) => handleChange("startTime", e.target.value)}
                    />
                </div>

                <div>
                    <span>End Time</span>
                    <Input
                        type="time"
                        value={endTime}
                        placeholder="End Time"
                        onChange={(e) => handleChange("endTime", e.target.value)}
                    />
                </div>
            </div>
        </Modal>
    );
};

export default UpdateRoom;
