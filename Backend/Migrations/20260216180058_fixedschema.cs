using System;
using System.Text.Json;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace GYMIND.API.Migrations
{
    /// <inheritdoc />
    public partial class fixedschema : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterDatabase()
                .Annotation("Npgsql:PostgresExtension:uuid-ossp", ",,");

            migrationBuilder.CreateTable(
                name: "gym",
                columns: table => new
                {
                    gymid = table.Column<Guid>(type: "uuid", nullable: false),
                    name = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    description = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: false),
                    isapproved = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    createdat = table.Column<DateTime>(type: "timestamp without time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_gym", x => x.gymid);
                });

            migrationBuilder.CreateTable(
                name: "locations",
                columns: table => new
                {
                    LocationID = table.Column<Guid>(type: "uuid", nullable: false),
                    Latitude = table.Column<decimal>(type: "numeric(18,6)", precision: 18, scale: 6, nullable: false),
                    Longitude = table.Column<decimal>(type: "numeric(18,6)", precision: 18, scale: 6, nullable: false),
                    City = table.Column<string>(type: "text", nullable: false),
                    Country = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_locations", x => x.LocationID);
                });

            migrationBuilder.CreateTable(
                name: "role",
                columns: table => new
                {
                    roleid = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    name = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    description = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_role", x => x.roleid);
                });

            migrationBuilder.CreateTable(
                name: "user",
                columns: table => new
                {
                    userid = table.Column<Guid>(type: "uuid", nullable: false),
                    fullname = table.Column<string>(type: "text", nullable: false),
                    email = table.Column<string>(type: "text", nullable: false),
                    phone = table.Column<string>(type: "text", nullable: true),
                    passwordhash = table.Column<string>(type: "text", nullable: false),
                    location = table.Column<string>(type: "text", nullable: true),
                    dateofbirth = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    MembershipID = table.Column<Guid>(type: "uuid", nullable: true),
                    gender = table.Column<string>(type: "text", nullable: true),
                    createdat = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    isactive = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    biography = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    profilepictureurl = table.Column<string>(type: "text", nullable: true),
                    haschangedname = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    medicalconditions = table.Column<string>(type: "text", nullable: true),
                    emergencycontact = table.Column<string>(type: "text", nullable: true),
                    refreshtoken = table.Column<string>(type: "text", nullable: true),
                    refreshtokenexpiry = table.Column<DateTime>(type: "timestamp without time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_user", x => x.userid);
                });

            migrationBuilder.CreateTable(
                name: "gymbranch",
                columns: table => new
                {
                    GymBranchID = table.Column<Guid>(type: "uuid", nullable: false),
                    gymid = table.Column<Guid>(type: "uuid", nullable: false),
                    locationid = table.Column<Guid>(type: "uuid", nullable: false),
                    name = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    OperatingHours = table.Column<JsonDocument>(type: "jsonb", nullable: false),
                    servicedescription = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    coverimageurl = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    isactive = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_gymbranch", x => x.GymBranchID);
                    table.ForeignKey(
                        name: "FK_gymbranch_gym_gymid",
                        column: x => x.gymid,
                        principalTable: "gym",
                        principalColumn: "gymid",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_gymbranch_locations_locationid",
                        column: x => x.locationid,
                        principalTable: "locations",
                        principalColumn: "LocationID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "systemadminactions",
                columns: table => new
                {
                    systemadminactionid = table.Column<Guid>(type: "uuid", nullable: false),
                    UserID = table.Column<Guid>(type: "uuid", nullable: false),
                    ActionType = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    TargetEntity = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    TargetID = table.Column<Guid>(type: "uuid", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    Outcome = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_systemadminactions", x => x.systemadminactionid);
                    table.ForeignKey(
                        name: "FK_systemadminactions_user_UserID",
                        column: x => x.UserID,
                        principalTable: "user",
                        principalColumn: "userid",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "userrole",
                columns: table => new
                {
                    userroleid = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    userid = table.Column<Guid>(type: "uuid", nullable: false),
                    roleid = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_userrole", x => x.userroleid);
                    table.ForeignKey(
                        name: "FK_userrole_role_roleid",
                        column: x => x.roleid,
                        principalTable: "role",
                        principalColumn: "roleid",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_userrole_user_userid",
                        column: x => x.userid,
                        principalTable: "user",
                        principalColumn: "userid",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "announcement",
                columns: table => new
                {
                    announcementid = table.Column<Guid>(type: "uuid", nullable: false),
                    GymBranchID = table.Column<Guid>(type: "uuid", nullable: false),
                    Title = table.Column<string>(type: "text", nullable: false),
                    Content = table.Column<string>(type: "text", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    ExpiresAt = table.Column<DateTime>(type: "timestamp without time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_announcement", x => x.announcementid);
                    table.ForeignKey(
                        name: "FK_announcement_gymbranch_GymBranchID",
                        column: x => x.GymBranchID,
                        principalTable: "gymbranch",
                        principalColumn: "GymBranchID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "gymadminaction",
                columns: table => new
                {
                    gymadminactionid = table.Column<Guid>(type: "uuid", nullable: false),
                    UserID = table.Column<Guid>(type: "uuid", nullable: false),
                    GymBranchID = table.Column<Guid>(type: "uuid", nullable: false),
                    ActionType = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    TargetEntity = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    TargetID = table.Column<Guid>(type: "uuid", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    Outcome = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_gymadminaction", x => x.gymadminactionid);
                    table.ForeignKey(
                        name: "FK_gymadminaction_gymbranch_GymBranchID",
                        column: x => x.GymBranchID,
                        principalTable: "gymbranch",
                        principalColumn: "GymBranchID",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_gymadminaction_user_UserID",
                        column: x => x.UserID,
                        principalTable: "user",
                        principalColumn: "userid",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "gymsession",
                columns: table => new
                {
                    GymSessionID = table.Column<Guid>(type: "uuid", nullable: false),
                    UserID = table.Column<Guid>(type: "uuid", nullable: false),
                    GymBranchID = table.Column<Guid>(type: "uuid", nullable: false),
                    CheckInTime = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    CheckOutTime = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    SessionDuration = table.Column<int>(type: "integer", nullable: true),
                    CheckInLat = table.Column<decimal>(type: "numeric(18,6)", precision: 18, scale: 6, nullable: false),
                    CheckInLong = table.Column<decimal>(type: "numeric(18,6)", precision: 18, scale: 6, nullable: false),
                    IsVerifiedLocation = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_gymsession", x => x.GymSessionID);
                    table.ForeignKey(
                        name: "FK_gymsession_gymbranch_GymBranchID",
                        column: x => x.GymBranchID,
                        principalTable: "gymbranch",
                        principalColumn: "GymBranchID",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_gymsession_user_UserID",
                        column: x => x.UserID,
                        principalTable: "user",
                        principalColumn: "userid",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "membership",
                columns: table => new
                {
                    membershipid = table.Column<Guid>(type: "uuid", nullable: false),
                    userid = table.Column<Guid>(type: "uuid", nullable: false),
                    gymid = table.Column<Guid>(type: "uuid", nullable: false),
                    gymbranchid = table.Column<Guid>(type: "uuid", nullable: true),
                    ismember = table.Column<bool>(type: "boolean", nullable: false),
                    ExpiryDate = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    joinedat = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    removedat = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    Description = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_membership", x => x.membershipid);
                    table.ForeignKey(
                        name: "FK_membership_gym_gymid",
                        column: x => x.gymid,
                        principalTable: "gym",
                        principalColumn: "gymid",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_membership_gymbranch_gymbranchid",
                        column: x => x.gymbranchid,
                        principalTable: "gymbranch",
                        principalColumn: "GymBranchID");
                    table.ForeignKey(
                        name: "FK_membership_user_userid",
                        column: x => x.userid,
                        principalTable: "user",
                        principalColumn: "userid",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "notification",
                columns: table => new
                {
                    notificationid = table.Column<Guid>(type: "uuid", nullable: false),
                    userid = table.Column<Guid>(type: "uuid", nullable: true),
                    gymid = table.Column<Guid>(type: "uuid", nullable: true),
                    gymbranchid = table.Column<Guid>(type: "uuid", nullable: true),
                    title = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    message = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    sentat = table.Column<DateTime>(type: "timestamp without time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_notification", x => x.notificationid);
                    table.ForeignKey(
                        name: "FK_notification_gym_gymid",
                        column: x => x.gymid,
                        principalTable: "gym",
                        principalColumn: "gymid");
                    table.ForeignKey(
                        name: "FK_notification_gymbranch_gymbranchid",
                        column: x => x.gymbranchid,
                        principalTable: "gymbranch",
                        principalColumn: "GymBranchID");
                    table.ForeignKey(
                        name: "FK_notification_user_userid",
                        column: x => x.userid,
                        principalTable: "user",
                        principalColumn: "userid");
                });

            migrationBuilder.CreateTable(
                name: "traffictrack",
                columns: table => new
                {
                    TrafficTrackID = table.Column<Guid>(type: "uuid", nullable: false),
                    GymBranchID = table.Column<Guid>(type: "uuid", nullable: false),
                    TrafficTimestamp = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    CapacityPercentage = table.Column<decimal>(type: "numeric(5,2)", precision: 5, scale: 2, nullable: true),
                    EntryCount = table.Column<int>(type: "integer", nullable: false),
                    IsRead = table.Column<bool>(type: "boolean", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_traffictrack", x => x.TrafficTrackID);
                    table.ForeignKey(
                        name: "FK_traffictrack_gymbranch_GymBranchID",
                        column: x => x.GymBranchID,
                        principalTable: "gymbranch",
                        principalColumn: "GymBranchID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "usernotification",
                columns: table => new
                {
                    usernotificationid = table.Column<Guid>(type: "uuid", nullable: false),
                    UserID = table.Column<Guid>(type: "uuid", nullable: false),
                    notificationid = table.Column<Guid>(type: "uuid", nullable: false),
                    readstatus = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    readat = table.Column<DateTime>(type: "timestamp without time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_usernotification", x => x.usernotificationid);
                    table.ForeignKey(
                        name: "FK_usernotification_notification_notificationid",
                        column: x => x.notificationid,
                        principalTable: "notification",
                        principalColumn: "notificationid",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_usernotification_user_UserID",
                        column: x => x.UserID,
                        principalTable: "user",
                        principalColumn: "userid",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_announcement_GymBranchID",
                table: "announcement",
                column: "GymBranchID");

            migrationBuilder.CreateIndex(
                name: "IX_gymadminaction_GymBranchID",
                table: "gymadminaction",
                column: "GymBranchID");

            migrationBuilder.CreateIndex(
                name: "IX_gymadminaction_UserID",
                table: "gymadminaction",
                column: "UserID");

            migrationBuilder.CreateIndex(
                name: "IX_gymbranch_gymid",
                table: "gymbranch",
                column: "gymid");

            migrationBuilder.CreateIndex(
                name: "IX_gymbranch_locationid",
                table: "gymbranch",
                column: "locationid");

            migrationBuilder.CreateIndex(
                name: "IX_gymsession_GymBranchID",
                table: "gymsession",
                column: "GymBranchID");

            migrationBuilder.CreateIndex(
                name: "IX_gymsession_UserID",
                table: "gymsession",
                column: "UserID");

            migrationBuilder.CreateIndex(
                name: "IX_membership_gymbranchid",
                table: "membership",
                column: "gymbranchid");

            migrationBuilder.CreateIndex(
                name: "IX_membership_gymid",
                table: "membership",
                column: "gymid");

            migrationBuilder.CreateIndex(
                name: "IX_membership_userid",
                table: "membership",
                column: "userid");

            migrationBuilder.CreateIndex(
                name: "IX_notification_gymbranchid",
                table: "notification",
                column: "gymbranchid");

            migrationBuilder.CreateIndex(
                name: "IX_notification_gymid",
                table: "notification",
                column: "gymid");

            migrationBuilder.CreateIndex(
                name: "IX_notification_userid",
                table: "notification",
                column: "userid");

            migrationBuilder.CreateIndex(
                name: "IX_systemadminactions_UserID",
                table: "systemadminactions",
                column: "UserID");

            migrationBuilder.CreateIndex(
                name: "IX_traffictrack_GymBranchID",
                table: "traffictrack",
                column: "GymBranchID");

            migrationBuilder.CreateIndex(
                name: "IX_usernotification_notificationid",
                table: "usernotification",
                column: "notificationid");

            migrationBuilder.CreateIndex(
                name: "IX_usernotification_UserID_notificationid",
                table: "usernotification",
                columns: new[] { "UserID", "notificationid" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_userrole_roleid",
                table: "userrole",
                column: "roleid");

            migrationBuilder.CreateIndex(
                name: "IX_userrole_userid_roleid",
                table: "userrole",
                columns: new[] { "userid", "roleid" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "announcement");

            migrationBuilder.DropTable(
                name: "gymadminaction");

            migrationBuilder.DropTable(
                name: "gymsession");

            migrationBuilder.DropTable(
                name: "membership");

            migrationBuilder.DropTable(
                name: "systemadminactions");

            migrationBuilder.DropTable(
                name: "traffictrack");

            migrationBuilder.DropTable(
                name: "usernotification");

            migrationBuilder.DropTable(
                name: "userrole");

            migrationBuilder.DropTable(
                name: "notification");

            migrationBuilder.DropTable(
                name: "role");

            migrationBuilder.DropTable(
                name: "gymbranch");

            migrationBuilder.DropTable(
                name: "user");

            migrationBuilder.DropTable(
                name: "gym");

            migrationBuilder.DropTable(
                name: "locations");
        }
    }
}
