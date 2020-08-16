import Database from "better-sqlite3";
import AttendanceService from "./AttendanceService";
import { expect } from "chai";
import { Session, AttendanceRecord } from "../../src/typings/attendance";
import UsersService from "./UsersService";

describe("AttendanceService", function () {
  describe("#startSession", function () {
    it("should add a new session to the sessions table", function () {
      const db = Database(":memory:");
      const attendanceService = new AttendanceService(db);

      const session_id = attendanceService.startSession();
      const session: Session = attendanceService.getSession(session_id);

      expect(session.session_id).to.equal(session_id);
      expect(session.session_start).to.be.a("number");
    });

    it("should throw if a session is already open", function () {
      const db = Database(":memory:");
      const attendanceService = new AttendanceService(db);

      attendanceService.startSession();
      expect(attendanceService.startSession).to.throw();
    });
  });

  describe("#closeSession", function () {
    it("should set session_end to the current time", function (done) {
      const db = Database(":memory:");
      const attendanceService = new AttendanceService(db);

      attendanceService.startSession();

      setTimeout(() => {
        const session_id = attendanceService.closeSession();
        const session: Session = attendanceService.getSession(session_id);
        expect(session.session_end).to.be.a("number");

        done();
      }, 10);
    });

    it("should throw if there is no open session", function () {
      const db = Database(":memory:");
      const attendanceService = new AttendanceService(db);

      expect(attendanceService.closeSession).to.throw();
    });
  });

  describe("#getSession", function () {
    it("should return correct session data", function () {
      const db = Database(":memory:");
      const attendanceService = new AttendanceService(db);

      const session_id = attendanceService.startSession();

      const session = attendanceService.getSession(session_id);

      expect(session.session_end).to.be.null;
      expect(session.session_id).to.equal(session_id);
      expect(session.session_start).to.be.a("number");
    });

    it("should return undefined \
if there is no session with the given session_id", function () {
      const db = Database(":memory:");
      const attendanceService = new AttendanceService(db);

      expect(attendanceService.getSession(768)).to.be.undefined;
    });
  });

  describe("#isThereOpenSession", function () {
    it("should return the correct boolean value", function (done) {
      const db = Database(":memory:");
      const attendanceService = new AttendanceService(db);

      expect(attendanceService.isThereOpenSession()).to.be.false;

      attendanceService.startSession();
      expect(attendanceService.isThereOpenSession()).to.be.true;

      // prevent race condition
      setTimeout(() => {
        attendanceService.closeSession();
        expect(attendanceService.isThereOpenSession()).to.be.false;

        done();
      }, 10);
    });
  });

  describe("#getCurrentSession", function () {
    it("should return current session \
or undefined id there is no current session", function (done) {
      const db = Database(":memory:");
      const attendanceService = new AttendanceService(db);

      expect(attendanceService.getCurrentSession()).to.be.undefined;

      const session_id = attendanceService.startSession();
      expect(attendanceService.getCurrentSession()?.session_id).to.equal(
        session_id
      );

      setTimeout(() => {
        attendanceService.closeSession();
        expect(attendanceService.getCurrentSession()).to.be.undefined;

        done();
      }, 10);
    });
  });

  describe("#markUserForCurrentSession", function () {
    it("should add a new entry into the attendance table", function () {
      const db = Database(":memory:");
      const attendanceService = new AttendanceService(db);
      const usersService = new UsersService(db);

      const user_id = usersService.addUser({ name: "Ptoeneigh" });

      const session_id = attendanceService.startSession();
      attendanceService.markUserForCurrentSession(user_id);

      const records: AttendanceRecord[] = attendanceService.getUserAttendanceData(
        user_id
      );

      const record = records[0];

      expect(records.length).to.equal(1);
      expect(record.attendee).to.equal(user_id);
      expect(record.attendee_arrival_time).to.be.a("number");
      expect(record.session).to.equal(session_id);
    });

    it("should throw if no session is open", function () {
      const db = Database(":memory:");
      const attendanceService = new AttendanceService(db);
      const usersService = new UsersService(db);

      const user_id = usersService.addUser({ name: "lol" });

      const attendanceRecorder = () =>
        attendanceService.markUserForCurrentSession(user_id);

      expect(attendanceRecorder).to.throw();
    });

    it("should throw if user is registered twice in the same session", function () {
      const db = Database(":memory:");
      const attendanceService = new AttendanceService(db);
      const usersService = new UsersService(db);

      attendanceService.startSession();

      const user_id = usersService.addUser({ name: "Ptoeneigh" });
      attendanceService.markUserForCurrentSession(user_id);

      const attendanceRecorder = () =>
        attendanceService.markUserForCurrentSession(user_id);

      expect(attendanceRecorder).to.throw();
    });
  });

  describe("#getAllAttendanceData", function () {
    it("should return all attendance data", function () {
      const db = Database(":memory:");
      const attendanceService = new AttendanceService(db);
      const usersService = new UsersService(db);

      const session_id = attendanceService.startSession();

      const user_id1 = usersService.addUser({ name: "Ptoeneigh" });
      const user_id2 = usersService.addUser({ name: "eli" });

      attendanceService.markUserForCurrentSession(user_id1);
      attendanceService.markUserForCurrentSession(user_id2);

      const attendanceData = attendanceService.getAllAttendanceData();

      expect(attendanceData.length).to.equal(2);
      expect(
        attendanceData.map(({ attendee }) => attendee).sort()
      ).to.deep.equal([user_id1, user_id2].sort());

      expect(attendanceData).to.satisfy((records: AttendanceRecord[]) => {
        for (const { attendee_arrival_time, session } of records) {
          if (
            !(
              typeof attendee_arrival_time === "number" &&
              attendee_arrival_time <= Date.now() &&
              session === session_id
            )
          )
            return false;
        }

        return true;
      });
    });
  });
});
